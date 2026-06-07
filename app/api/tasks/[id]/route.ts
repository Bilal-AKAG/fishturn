import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task } from "@/db/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const body = await request.json();

	const [existing] = await db
		.select()
		.from(task)
		.where(and(eq(task.id, id), eq(task.userId, session.user.id)));

	if (!existing) {
		return Response.json({ error: "Not found" }, { status: 404 });
	}

	const allowed = ["title", "description", "status", "position"] as const;
	const updates: Record<string, unknown> = { updatedAt: new Date() };
	for (const key of allowed) {
		if (key in body) updates[key] = body[key];
	}

	const [updated] = await db.update(task).set(updates).where(eq(task.id, id)).returning();

	return Response.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;

	await db.delete(task).where(and(eq(task.id, id), eq(task.userId, session.user.id)));

	return new Response(null, { status: 204 });
}
