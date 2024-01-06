
import { currentUser } from '@/lib/auth';
import { TRPCError, initTRPC } from '@trpc/server';

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create();
const middleware = t.middleware;

const isAuth = middleware(async opts => {

	const user = await currentUser();

	if (!user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}

	return opts.next({
		ctx: {
			userId: user.id,
			user,
			userEmail: user.email,
			role: user.role,
		},
	});
});

const isAdminAuth = middleware(async opts => {

	const user = await currentUser();

	if (!user) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not logged in!' });
	}

	if (user.role !== 'ADMIN') {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not an admin!' });
	}

	return opts.next({
		ctx: {
			userId: user.id,
			user,
			userEmail: user.email,
			role: user.role,
		},
	});
});

// Base router and procedure helpers
export const router = t.router;
export const merge = t.mergeRouters;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuth);
export const adminProcedure = t.procedure.use(isAdminAuth);