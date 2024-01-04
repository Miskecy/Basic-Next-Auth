// Next adapter not support app router. only next.js pages router
// import * as trpcNext from '@trpc/server/adapters/next';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc';

// export API handler
// @see https://trpc.io/docs/server/adapters
const handler = (req: Request) => fetchRequestHandler({
	endpoint: '/api/trpc',
	req,
	router: appRouter,
	createContext: () => ({})
});

export { handler as GET, handler as POST };