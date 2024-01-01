"use server";

import { z } from 'zod';

import { ForgotPasswordSchema } from '@/schemas';
import { getUserByEmail } from '@/server/utils/user';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';

export const reset = async (values: z.infer<typeof ForgotPasswordSchema>) => {
	const validatedFields = ForgotPasswordSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid email.", fields: validatedFields.error.issues };
	}

	const { email } = validatedFields.data;

	const existingUser = await getUserByEmail(email);

	if (!existingUser || !existingUser.password || !existingUser.email) {
		return { error: "Email does not exist!" };
	}

	if (!existingUser.emailVerified) {
		return { error: "Email not verified!" };
	}

	const passwordResetToken = await generatePasswordResetToken(email);
	await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

	return { success: "Password reset email sent!" };
}