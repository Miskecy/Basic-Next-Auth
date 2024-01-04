import { z } from 'zod';
import { publicProcedure, router } from '@/server/trpc/trpc';

export const testRouter = router({
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