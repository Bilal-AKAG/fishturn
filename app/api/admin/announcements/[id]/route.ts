import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { announcement } from "@/db/schema";

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
	if ((session.user as { role?: string | null }).role !== "admin") {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;
	await db.delete(announcement).where(eq(announcement.id, id));

	return new Response(null, { status: 204 });
}
