import { protectedProcedure, publicProcedure, router } from "../trpc";

export const testRouter = router({
	publicTest: publicProcedure.query(() => {
		return { success: "Test successful! TRPC Public Procedure is working normally." };
	}),
	protectTest: protectedProcedure.query(() => {
		return { success: "Test successful! TRPC Protected Procedure is working normally." };
	})
})