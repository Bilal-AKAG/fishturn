import { headers } from "next/headers";
import { asc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task } from "@/db/schema";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ userId: string }> },
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
	if ((session.user as { role?: string | null }).role !== "admin") {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const { userId } = await params;

	const tasks = await db
		.select()
		.from(task)
		.where(eq(task.userId, userId))
		.orderBy(asc(task.position));

	return Response.json(tasks);
}
