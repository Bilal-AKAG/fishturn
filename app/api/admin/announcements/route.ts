import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { announcement, user } from "@/db/schema";

async function requireAdmin() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
	if ((session.user as { role?: string | null }).role !== "admin") {
		return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
	}
	return { session };
}

export async function GET() {
	const { error } = await requireAdmin();
	if (error) return error;

	const rows = await db
		.select({
			id: announcement.id,
			title: announcement.title,
			message: announcement.message,
			createdBy: announcement.createdBy,
			authorName: user.name,
			createdAt: announcement.createdAt,
		})
		.from(announcement)
		.leftJoin(user, eq(user.id, announcement.createdBy))
		.orderBy(desc(announcement.createdAt));

	return Response.json(rows);
}

export async function POST(request: Request) {
	const { session, error } = await requireAdmin();
	if (error || !session) return error ?? Response.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { title, message } = body;

	if (!title?.trim() || !message?.trim()) {
		return Response.json({ error: "Title and message are required" }, { status: 400 });
	}

	const [entry] = await db
		.insert(announcement)
		.values({
			id: crypto.randomUUID(),
			title: title.trim(),
			message: message.trim(),
			createdBy: session.user.id,
		})
		.returning();

	return Response.json(entry, { status: 201 });
}
