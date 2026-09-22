import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, warning } from "@/db/schema";

async function requireAdmin() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
	if ((session.user as { role?: string | null }).role !== "admin") {
		return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
	}
	return { session };
}

export async function GET(request: Request) {
	const { error } = await requireAdmin();
	if (error) return error;

	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	const base = db
		.select({
			id: warning.id,
			userId: warning.userId,
			title: warning.title,
			message: warning.message,
			createdBy: warning.createdBy,
			authorName: user.name,
			readAt: warning.readAt,
			createdAt: warning.createdAt,
		})
		.from(warning)
		.leftJoin(user, eq(user.id, warning.userId))
		.orderBy(desc(warning.createdAt));

	const rows = userId
		? await base.where(eq(warning.userId, userId))
		: await base;

	return Response.json(rows);
}

export async function POST(request: Request) {
	const { session, error } = await requireAdmin();
	if (error || !session) return error ?? Response.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { userId, title, message } = body;

	if (!userId || !title?.trim() || !message?.trim()) {
		return Response.json({ error: "userId, title and message are required" }, { status: 400 });
	}

	if (userId === session.user.id) {
		return Response.json({ error: "You cannot warn yourself" }, { status: 400 });
	}

	const [target] = await db.select({ id: user.id }).from(user).where(eq(user.id, userId));
	if (!target) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	const [entry] = await db
		.insert(warning)
		.values({
			id: crypto.randomUUID(),
			userId,
			title: title.trim(),
			message: message.trim(),
			createdBy: session.user.id,
		})
		.returning();

	return Response.json(entry, { status: 201 });
}
