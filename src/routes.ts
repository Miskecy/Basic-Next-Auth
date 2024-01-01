/**
 * An array of routes that are public
 * These routes are accessible by Signed In and Signed Out users
 * @type {string[]}
 */
export const publicRoutes = [
	"/",
	"/auth/new-verification"
]

/**
 * An array of routes that are protected
 * These routes are accessible by Signed In users
 * @type {string[]}
 */
export const authRoutes = [
	"/auth/sign-in",
	"/auth/sign-up",
	"/auth/error",
	"/auth/forgot-password",
	"/auth/new-password",
]

/**
 * The Prefix for the API authentication routes
 * Routes that start with this prefix are used for API
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect URL after login in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT_URL = "/settings";