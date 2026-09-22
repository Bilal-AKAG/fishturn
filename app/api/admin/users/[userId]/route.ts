import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ userId: string }> },
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
	if ((session.user as { role?: string | null }).role !== "admin") {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const { userId } = await params;

	if (userId === session.user.id) {
		return Response.json({ error: "You cannot delete your own account" }, { status: 400 });
	}

	const [target] = await db.select({ role: user.role }).from(user).where(eq(user.id, userId));
	if (!target) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}
	if (target.role === "admin") {
		return Response.json({ error: "Admin accounts cannot be deleted" }, { status: 403 });
	}

	// Related tasks, feedback, and warnings are removed via ON DELETE CASCADE.
	await db.delete(user).where(eq(user.id, userId));

	return new Response(null, { status: 204 });
}
