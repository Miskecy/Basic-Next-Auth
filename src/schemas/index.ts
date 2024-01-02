import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const SettingsSchema = z.object({
	name: z.optional(z.string()),
	isTwoFactorEnabled: z.optional(z.boolean()),
	role: z.enum([UserRole.ADMIN, UserRole.USER]),
	email: z.optional(z.string().email()),
	password: z.optional(z.string().min(6)),
	newPassword: z.optional(z.string().min(6)),
	newPasswordConfirm: z.optional(z.string().min(6)),
})
	.refine((data) => (data.password && data.newPassword), {
		message: 'New password is required',
		path: ['newPassword'],
	})
	.refine((data) => (data.newPassword && data.newPasswordConfirm), {
		message: 'New password confirmation is required',
		path: ['newPasswordConfirm'],
	})
	.refine((data) => data.newPassword === data.newPasswordConfirm, {
		message: 'Passwords must match',
		path: ['newPasswordConfirm'],
	});

export const SignInSchema = z.object({
	email: z.string().email({
		message: 'Email must be a valid email',
	}),
	password: z.string().min(1, {
		message: 'Password must be a valid password',
	}),
	code: z.optional(z.string())
});

export const SignUpSchema = z.object({
	email: z.string().email({
		message: 'Email must be a valid email',
	}),
	// password and passwordConfirm must match
	password: z.string().min(6, {
		message: 'Minimum 6 characters',
	}),
	passwordConfirm: z.string().min(6, {
		message: 'Minimum 6 characters',
	}),
	name: z.string().min(1, {
		message: 'Name is required',
	}),
}).refine((data) => data.password === data.passwordConfirm, {
	message: 'Passwords must match',
	path: ['passwordConfirm'],
});

export const ForgotPasswordSchema = z.object({
	email: z.string().email({
		message: 'Email must be a valid email',
	}),
});

export const NewPasswordSchema = z.object({
	// password and passwordConfirm must match
	password: z.string().min(6, {
		message: 'Minimum 6 characters',
	}),
	passwordConfirm: z.string().min(6, {
		message: 'Minimum 6 characters',
	}),
}).refine((data) => data.password === data.passwordConfirm, {
	message: 'Passwords must match',
	path: ['passwordConfirm'],
});