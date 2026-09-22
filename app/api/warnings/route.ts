import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, warning } from "@/db/schema";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const rows = await db
		.select({
			id: warning.id,
			title: warning.title,
			message: warning.message,
			authorName: user.name,
			readAt: warning.readAt,
			createdAt: warning.createdAt,
		})
		.from(warning)
		.leftJoin(user, eq(user.id, warning.createdBy))
		.where(eq(warning.userId, session.user.id))
		.orderBy(desc(warning.createdAt));

	return Response.json(rows);
}
