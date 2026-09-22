import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { feedback, user } from "@/db/schema";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
	if ((session.user as { role?: string | null }).role !== "admin") {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const rows = await db
		.select({
			id: feedback.id,
			message: feedback.message,
			category: feedback.category,
			userId: feedback.userId,
			authorName: user.name,
			authorEmail: user.email,
			createdAt: feedback.createdAt,
		})
		.from(feedback)
		.leftJoin(user, eq(user.id, feedback.userId))
		.orderBy(desc(feedback.createdAt));

	return Response.json(rows);
}
