import { headers } from "next/headers";

import { auth } from "@/lib/auth";

/**
 * Centralized auth checks (Data Access Layer).
 * Always verify on the server with `auth.api.getSession()` — the proxy only
 * does an optimistic cookie-existence check.
 */

export async function requireSession() {
	const session = await auth.api.getSession({ headers: await headers() });
	return session;
}

export type Session = NonNullable<Awaited<ReturnType<typeof requireSession>>>;

export function isAdmin(session: Session | null): session is Session {
	return !!session && (session.user as { role?: string | null }).role === "admin";
}

export async function requireAdmin() {
	const session = await requireSession();
	if (!session) return { session: null, isAdmin: false };
	return { session, isAdmin: isAdmin(session) };
}
