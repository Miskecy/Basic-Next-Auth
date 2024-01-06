import z from 'zod';
import { AuthError } from 'next-auth';
import { router, publicProcedure } from '@/server/trpc/trpc';
import bcrypt from 'bcryptjs'

import { signIn, signOut } from '@/auth';
import db from '@/lib/db';
import { ForgotPasswordSchema, NewPasswordSchema, SignInSchema, SignUpSchema } from '@/schemas';

import { getUserByEmail } from '@/server/utils/user';
import { getTwoFactorTokenByEmail } from '@/server/utils/two-factor-token';
import { getTwoFactorConfirmationByUserId } from '@/server/utils/two-factor-confirmation';

import { generatePasswordResetToken, generateTwoFactorToken, generateVerificationToken } from '@/lib/tokens';
import { sendPasswordResetEmail, sendTwoFactorToken, sendVerificationEmail } from '@/lib/mail';
import { TRPCError } from '@trpc/server';
import { getPasswordResetTokenByToken } from '@/server/utils/password-reset-token';
import { getVerificationTokenByToken } from '@/server/utils/verification-token';

export const authRouter = router({
	login: publicProcedure.input(
		z.object({
			data: SignInSchema,
		})
	).mutation(async ({ input }) => {
		const { email, password, code } = input.data;

		const existingUser = await getUserByEmail(email);

		// Check witch provider is used
		if (!existingUser || !existingUser.password || !existingUser.email) {
			// return { error: "Email does not exist!" };
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Email already in use.',
			});
		}

		// Check if email is verified
		if (!existingUser.emailVerified) {
			const verificationToken = await generateVerificationToken(existingUser.email);
			await sendVerificationEmail(verificationToken.email, verificationToken.token);

			return { success: "Confirmation email sent!" };
		}

		// Check if password is correct
		const passwordMatches = await bcrypt.compare(password, existingUser.password);

		if (!passwordMatches) {
			// return { error: "Invalid credentials." };
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Invalid credentials.',
			});
		}

		// Check if two factor is enabled
		if (existingUser.isTwoFactorEnabled && existingUser.email) {
			// Check if code is provided
			if (code) {
				const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

				if (!twoFactorToken) {
					// return { error: "Invalid code." };
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'Invalid code.',
					});
				}

				if (twoFactorToken.token !== code) {
					// return { error: "Invalid code." };
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'Invalid code.',
					});
				}

				const hasExpired = new Date(twoFactorToken.expires) < new Date();

				if (hasExpired) {
					// return { error: "Code has expired." };

					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'Code has expired.',
					});
				}

				await db.twoFactorToken.delete({
					where: {
						id: twoFactorToken.id
					}
				});

				const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

				if (existingConfirmation) {
					await db.twoFactorConfirmation.delete({
						where: {
							id: existingConfirmation.id
						}
					})
				}

				await db.twoFactorConfirmation.create({
					data: {
						userId: existingUser.id
					}
				});
			} else {
				// Generate new code and send it
				const twoFactorToken = await generateTwoFactorToken(existingUser.email);
				await sendTwoFactorToken(existingUser.email, twoFactorToken.token);

				return { twoFactor: true };
			}
		}

		try {
			await signIn("credentials", {
				email,
				password,
				redirect: false
			});
		} catch (error) {
			if (error instanceof AuthError) {
				switch (error.type) {
					case "CredentialsSignin":
						// return { error: "Invalid credentials." };
						throw new TRPCError({
							code: 'UNAUTHORIZED',
							message: 'Invalid credentials.',
							cause: error,
						});
					default:
						// return { error: "Something went wrong." };
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Something went wrong.',
							cause: error,
						});
				}
			}

			throw error;
		}
	}),
	register: publicProcedure.input(z.object({
		data: SignUpSchema
	})).mutation(async ({ input }) => {
		const { name, email, password } = input.data;

		// encrypt password
		const hashedPassword = await bcrypt.hash(password, 10);

		// verify email is not already in use
		const existingUser = await getUserByEmail(email);

		if (existingUser) {
			// return { error: "Email already in use." };
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Email already in use.',
			});
		}

		// create user
		await db.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});

		const verificationToken = await generateVerificationToken(email);

		// send email verification
		await sendVerificationEmail(verificationToken.email, verificationToken.token);

		return {
			success: "Confirmation email sent!",
		};
	}),
	reset: publicProcedure.input(z.object({
		data: ForgotPasswordSchema
	})).mutation(async ({ input }) => {
		const { email } = input.data;

		const existingUser = await getUserByEmail(email);

		if (!existingUser || !existingUser.password || !existingUser.email) {
			// return { error: "Email does not exist!" };
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Email already in use.',
			});
		}

		if (!existingUser.emailVerified) {
			// return { error: "Email not verified!" };
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Email not verified.',
			});
		}

		const passwordResetToken = await generatePasswordResetToken(email);
		await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

		return { success: "Password reset email sent!" };
	}),
	newPassword: publicProcedure.input(z.object({
		data: NewPasswordSchema,
		token: z.string().nullable()
	})).mutation(async ({ input }) => {
		const { password } = input.data;
		const token = input.token;

		if (!token) {
			// return { error: "Missing token." };
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Missing token.',
			});
		}

		const existingToken = await getPasswordResetTokenByToken(token);

		if (!existingToken) {
			// return { error: "Invalid token!" };
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Invalid token.',
			});
		}

		const hasExpired = new Date(existingToken.expires) < new Date();

		if (hasExpired) {
			// return { error: "Token has expired!" };
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Token has expired.',
			});
		}

		const existingUser = await getUserByEmail(existingToken.email);

		if (!existingUser) {
			// return { error: "Email does not exist!" };
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Email does not exist.',
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await db.user.update({
			where: { id: existingUser.id },
			data: {
				password: hashedPassword
			}
		});

		await db.passwordResetToken.delete({
			where: { id: existingToken.id }
		});

		return { success: "Password has been updated!" };
	}),
	emailConfirmation: publicProcedure.input(z.object({
		token: z.string().nullable()
	})).mutation(async ({ input }) => {
		const { token } = input;

		if (!token) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Missing token.',
			});
		}

		const existingToken = await getVerificationTokenByToken(token);

		if (!existingToken) {
			// return { error: "Token does not exist" };
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Invalid token.',
			});
		}

		const hasExpired = new Date(existingToken.expires) < new Date();

		if (hasExpired) {
			// return { error: "Token has expired" };
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Token has expired.',
			});
		}

		const existingUser = await getUserByEmail(existingToken.email);

		if (!existingUser) {
			// return { error: "Email does not exist" };
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Email does not exist.',
			});
		}

		await db.user.update({
			where: {
				id: existingUser.id
			},
			data: {
				emailVerified: new Date(),
				email: existingToken.email
			},
		})

		await db.verificationToken.delete({
			where: {
				id: existingToken.id
			}
		})

		return { success: "Email has been verified!" };
	}),
	logout: publicProcedure.mutation(async () => {
		await signOut({ redirect: false });
	})
})