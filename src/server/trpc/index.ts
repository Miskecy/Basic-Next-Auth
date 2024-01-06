import { merge } from '@/server/trpc/trpc';

import { testRouter } from '@/server/trpc/routers/test';
import { authRouter } from '@/server/trpc/routers/auth';
import { settingsRouter } from './routers/settings';

export const appRouter = merge(
	authRouter,
	settingsRouter,
	testRouter
);

// export type definition of API
export type AppRouter = typeof appRouter;