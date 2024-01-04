import { z } from 'zod';
import { publicProcedure, router } from '@/server/trpc/trpc';

export const appRouter = router({
	hello: publicProcedure
		.input(
			z.object({
				text: z.string(),
			}),
		)
		.query((opts) => {
			return {
				greeting: `hello ${opts.input.text}`,
			};
		}),
	getArray: publicProcedure.query(() => {
		return [1, 2, 3]
	})
});

// export type definition of API
export type AppRouter = typeof appRouter;