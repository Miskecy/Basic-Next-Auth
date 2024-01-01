"use server";

import { z } from 'zod';
import bcrypt from 'bcryptjs';

import db from '@/lib/db';
import { SignUpSchema } from '@/schemas';
import { getUserByEmail } from '@/server/utils/user';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

export const register = async (values: z.infer<typeof SignUpSchema>) => {
	const validatedFields = SignUpSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid fields.", fields: validatedFields.error.issues };
	}

	const { name, email, password } = validatedFields.data;

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
}