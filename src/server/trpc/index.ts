import { merge } from '@/server/trpc/trpc';

import { authRouter } from '@/server/trpc/routers/auth';

export const appRouter = merge(
	authRouter
);

// export type definition of API
export type AppRouter = typeof appRouter;