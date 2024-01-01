import db from "@/lib/db";
import { getPasswordResetTokenByEmail } from "@/server/utils/password-reset-token";
import { getVerificationTokenByEmail } from "@/server/utils/verification-token";

export const generatePasswordResetToken = async (email: string) => {
	const token = crypto.randomUUID();
	const lifetime = 3600 * 1000; // 1 hour
	const expires = new Date(new Date().getTime() + lifetime);

	const existingToken = await getPasswordResetTokenByEmail(email);

	if (existingToken) {
		await db.passwordResetToken.delete({
			where: {
				id: existingToken.id
			}
		});
	}
	const passwordResetToken = await db.passwordResetToken.create({
		data: {
			email,
			token,
			expires
		}
	});

	return passwordResetToken;
};

export const generateVerificationToken = async (email: string) => {
	const token = crypto.randomUUID();
	const lifetime = 3600 * 1000; // 1 hour
	const expires = new Date(new Date().getTime() + lifetime);

	const existingToken = await getVerificationTokenByEmail(email);

	if (existingToken) {
		await db.verificationToken.delete({
			where: {
				id: existingToken.id
			}
		});
	}
	const verificationToken = await db.verificationToken.create({
		data: {
			email,
			token,
			expires
		}
	});


	return verificationToken;
}