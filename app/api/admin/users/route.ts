import { headers } from "next/headers";
import { ne } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
	if ((session.user as { role?: string | null }).role !== "admin") {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	// Admins manage interns here; exclude other admins from the dropdown.
	const users = await db
		.select({ id: user.id, name: user.name, email: user.email, image: user.image })
		.from(user)
		.where(ne(user.role, "admin"));

	return Response.json(users);
}
