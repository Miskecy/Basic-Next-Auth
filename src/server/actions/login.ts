"use server";

import { z } from 'zod';

import { signIn } from '@/auth';
import { SignInSchema } from '@/schemas';
import { DEFAULT_LOGIN_REDIRECT_URL } from '@/routes';
import { AuthError } from 'next-auth';
import { getUserByEmail } from '@/server/utils/user';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

export const login = async (values: z.infer<typeof SignInSchema>) => {
	const validatedFields = SignInSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid fields.", fields: validatedFields.error.issues };
	}

	const { email, password } = validatedFields.data;

	const existingUser = await getUserByEmail(email);

	if (!existingUser || !existingUser.password || !existingUser.email) {
		return { error: "Email does not exist!" };
	}

	if (!existingUser.emailVerified) {
		const verificationToken = await generateVerificationToken(existingUser.email);
		await sendVerificationEmail(verificationToken.email, verificationToken.token);

		return { success: "Confirmation email sent!" };
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