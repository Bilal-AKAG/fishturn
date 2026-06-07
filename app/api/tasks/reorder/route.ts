import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task } from "@/db/schema";
import type { TaskStatus } from "@/lib/tasks";

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const { updates } = await request.json();

	if (!Array.isArray(updates) || updates.length === 0) {
		return Response.json({ error: "updates must be a non-empty array" }, { status: 400 });
	}

	await Promise.all(
		updates.map(({ id, status, position }: { id: string; status: TaskStatus; position: number }) =>
			db
				.update(task)
				.set({ status, position, updatedAt: new Date() })
				.where(and(eq(task.id, id), eq(task.userId, session.user.id))),
		),
	);

	return Response.json({ ok: true });
}
