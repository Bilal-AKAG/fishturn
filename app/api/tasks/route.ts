import { headers } from "next/headers";
import { and, asc, desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task } from "@/db/schema";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const tasks = await db
		.select()
		.from(task)
		.where(eq(task.userId, session.user.id))
		.orderBy(asc(task.position));

	return Response.json(tasks);
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { title, description, status = "todo" } = body;

	if (!title?.trim()) {
		return Response.json({ error: "Title is required" }, { status: 400 });
	}

	const existing = await db
		.select({ position: task.position })
		.from(task)
		.where(and(eq(task.userId, session.user.id), eq(task.status, status)))
		.orderBy(desc(task.position))
		.limit(1);

	const position = (existing[0]?.position ?? -1) + 1;

	const [newTask] = await db
		.insert(task)
		.values({
			id: crypto.randomUUID(),
			title: title.trim(),
			description: description?.trim() || null,
			status,
			position,
			userId: session.user.id,
		})
		.returning();

	return Response.json(newTask, { status: 201 });
}
