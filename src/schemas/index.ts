import { z } from 'zod';

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
