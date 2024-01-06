import { adminProcedure, router } from "@/server/trpc/trpc";

export const adminRoute = router({
	admin: adminProcedure.mutation(({ ctx }) => {
		return { success: "You are an admin!" }
	})
})