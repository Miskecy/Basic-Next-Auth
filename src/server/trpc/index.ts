import { merge } from '@/server/trpc/trpc';

import { testRouter } from '@/server/trpc/routers/test';

export const appRouter = merge(
	testRouter
);

// export type definition of API
export type AppRouter = typeof appRouter;