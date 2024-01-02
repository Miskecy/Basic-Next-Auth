'use server';

import z from "zod";
import bcrypt from "bcryptjs";
import { SettingsSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import { getUserByEmail, getUserById } from "../utils/user";
import db from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
	const user = await currentUser();

	if (!user) {
		return { error: "Unauthorized" };
	}

	const dbUser = await getUserById(user.id);

	if (!dbUser) {
		return { error: "Unauthorized" };
	}

	if (user.isOAuth) {
		values.email = undefined;
		values.password = undefined;
		values.newPassword = undefined;
		values.newPasswordConfirm = undefined;
		values.isTwoFactorEnabled = undefined;
	}

	if (values.email && values.email !== user.email) {
		const existingUser = await getUserByEmail(values.email);

		if (existingUser) {
			return { error: "Email already in use!" };
		}

		const verificationToken = await generateVerificationToken(values.email);

		await sendVerificationEmail(verificationToken.email, verificationToken.token);

		return { success: "Please verify your email address!" };
	}

	if (values.password && values.newPassword && dbUser.password) {
		const passwordMatch = await bcrypt.compare(values.password, dbUser.password);

		if (!passwordMatch) {
			return { error: "Password incorrect!" };
		}

		const hashedPassword = await bcrypt.hash(values.newPassword, 10);

		values.password = hashedPassword;
		values.newPassword = undefined;
		values.newPasswordConfirm = undefined;
	}

	await db.user.update({
		where: {
			id: user.id,
		},
		data: {
			...values
		},
	})

	return { success: "Settings has been updated!" };
}