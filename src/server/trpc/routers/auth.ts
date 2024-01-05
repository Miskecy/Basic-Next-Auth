import z from 'zod';
import { AuthError } from 'next-auth';
import { router, publicProcedure } from '@/server/trpc/trpc';
import bcrypt from 'bcryptjs'

import { signIn } from '@/auth';
import db from '@/lib/db';
import { SignInSchema, SignUpSchema } from '@/schemas';

import { getUserByEmail } from '@/server/utils/user';
import { getTwoFactorTokenByEmail } from '@/server/utils/two-factor-token';
import { getTwoFactorConfirmationByUserId } from '@/server/utils/two-factor-confirmation';

import { generateTwoFactorToken, generateVerificationToken } from '@/lib/tokens';
import { sendTwoFactorToken, sendVerificationEmail } from '@/lib/mail';

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
			return { error: "Email does not exist!" };
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
			return { error: "Invalid credentials." };
		}

		// Check if two factor is enabled
		if (existingUser.isTwoFactorEnabled && existingUser.email) {
			// Check if code is provided
			if (code) {
				const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

				if (!twoFactorToken) {
					return { error: "Invalid code." };
				}

				if (twoFactorToken.token !== code) {
					return { error: "Invalid code." };
				}

				const hasExpired = new Date(twoFactorToken.expires) < new Date();

				if (hasExpired) {
					return { error: "Code has expired." };
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
						return { error: "Invalid credentials." };
					default:
						return { error: "Something went wrong." };
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
			return { error: "Email already in use." };
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
	test: publicProcedure.query(async () => {
		return { success: "Test successful!" };
	})
})