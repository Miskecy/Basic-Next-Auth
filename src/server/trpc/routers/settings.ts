import { z } from "zod";
import bcrypt from "bcryptjs";

import { protectedProcedure, router } from "@/server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { getUserByEmail, getUserById } from "@/server/utils/user";

import { SettingsSchema } from "@/schemas";

import db from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";


export const settingsRouter = router({
	updateSettings: protectedProcedure.input(z.object({
		data: SettingsSchema
	})).mutation(async ({ ctx, input }) => {

		const { userId, user } = ctx;
		const { data } = input;

		const dbUser = await getUserById(userId);

		if (!dbUser) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "You are not authorized to perform this action"
			})
		}

		if (user.isOAuth) {
			data.email = undefined;
			data.password = undefined;
			data.newPassword = undefined;
			data.newPasswordConfirm = undefined;
			data.isTwoFactorEnabled = undefined;
		}

		if (data.email && data.email !== user.email) {
			const existingUser = await getUserByEmail(data.email);

			if (existingUser) {
				// return { error: "Email already in use!" };
				throw new TRPCError({
					code: "CONFLICT",
					message: "Email already in use!"
				})
			}

			const verificationToken = await generateVerificationToken(data.email);

			await sendVerificationEmail(verificationToken.email, verificationToken.token);

			return { success: "Please verify your email address!" };
		}

		if (data.password && data.newPassword && dbUser.password) {
			const passwordMatch = await bcrypt.compare(data.password, dbUser.password);

			if (!passwordMatch) {
				// return { error: "Password incorrect!" };
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Password incorrect!"
				})
			}

			const hashedPassword = await bcrypt.hash(data.newPassword, 10);

			data.password = hashedPassword;
			data.newPassword = undefined;
			data.newPasswordConfirm = undefined;
		}

		await db.user.update({
			where: {
				id: user.id,
			},
			data: {
				...data
			},
		})

		return { success: "Settings has been updated!" };

	})
})