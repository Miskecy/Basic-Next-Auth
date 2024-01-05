import z from 'zod';
import { AuthError } from 'next-auth';
import { router, publicProcedure } from '@/server/trpc/trpc';

import { signIn } from '@/auth';
import db from '@/lib/db';
import { SignInSchema } from '@/schemas';

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
		const { data } = input;
		const validatedFields = SignInSchema.safeParse(data);

		if (!validatedFields.success) {
			return { error: "Invalid fields." };
		}

		const { email, password, code } = validatedFields.data;

		const existingUser = await getUserByEmail(email);

		if (!existingUser || !existingUser.password || !existingUser.email) {
			return { error: "Email does not exist!" };
		}

		if (!existingUser.emailVerified) {
			const verificationToken = await generateVerificationToken(existingUser.email);
			await sendVerificationEmail(verificationToken.email, verificationToken.token);

			return { success: "Confirmation email sent!" };
		}

		if (existingUser.isTwoFactorEnabled && existingUser.email) {
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
	test: publicProcedure.query(async () => {
		return { success: "Test successful!" };
	})
})