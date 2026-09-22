import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic auth check (per https://better-auth.com/docs/integrations/next
// and the Next.js "Optimistic checks with Proxy" guide). This only checks for
// the *existence* of a session cookie and never touches the database.
// Authoritative checks (including the admin role check) happen in
// app/admin/layout.tsx, app/(dashboard)/layout.tsx and the API routes via
// `auth.api.getSession()`.

const PROTECTED_PREFIXES = ["/dashboard", "/kanban", "/feedback", "/admin"];

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isProtected = PROTECTED_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);

	if (!isProtected) {
		return NextResponse.next();
	}

	const sessionCookie = getSessionCookie(request);

	if (!sessionCookie) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/kanban/:path*", "/feedback/:path*", "/admin/:path*"],
};
