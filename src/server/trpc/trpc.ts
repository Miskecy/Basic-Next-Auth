
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
			userEmail: user.email,
			role: user.role,
		},
	});
});

// Base router and procedure helpers
export const router = t.router;
export const merge = t.mergeRouters;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure;