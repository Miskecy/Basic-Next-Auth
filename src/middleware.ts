import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
	DEFAULT_LOGIN_REDIRECT_URL,
	publicRoutes,
	authRoutes,
	apiAuthPrefix
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const { nextUrl } = req;
	const isAuthenticated = !!req.auth;

	const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
	const isAuthRoute = authRoutes.includes(nextUrl.pathname);
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

	if (isApiAuthRoute) {
		return null;
	}

	if (isAuthRoute) {
		if (isAuthenticated) {
			return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT_URL, nextUrl));
		}
		return null;
	}

	if (!isAuthenticated && !isPublicRoute) {
		return Response.redirect(new URL("/auth/sign-in", nextUrl));
	}

	return null;
})

// Optionally, don't invoke Middleware on some paths
export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};