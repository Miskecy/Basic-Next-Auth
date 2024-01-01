"use server";

import { z } from 'zod';

import db from '@/lib/db';
import { signIn } from '@/auth';
import { SignInSchema } from '@/schemas';
import { DEFAULT_LOGIN_REDIRECT_URL } from '@/routes';
import { AuthError } from 'next-auth';
import { getUserByEmail } from '@/server/utils/user';
import { generateTwoFactorToken, generateVerificationToken } from '@/lib/tokens';
import { sendTwoFactorToken, sendVerificationEmail } from '@/lib/mail';
import { getTwoFactorTokenByEmail } from '@/server/utils/two-factor-token';
import { getTwoFactorConfirmationByUserId } from '@/server/utils/two-factor-confirmation';

export const login = async (values: z.infer<typeof SignInSchema>) => {
	const validatedFields = SignInSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid fields.", fields: validatedFields.error.issues };
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
			redirectTo: DEFAULT_LOGIN_REDIRECT_URL
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
}