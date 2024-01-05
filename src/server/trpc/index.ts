import { merge } from '@/server/trpc/trpc';

import { testRouter } from '@/server/trpc/routers/test';
import { authRouter } from '@/server/trpc/routers/auth';

export const appRouter = merge(
	authRouter,
	testRouter
);

// export type definition of API
export type AppRouter = typeof appRouter;