import { headers } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { warning } from "@/db/schema";

export async function POST(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;

	// Only the warned intern can acknowledge their own warning.
	const [updated] = await db
		.update(warning)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(warning.id, id),
				eq(warning.userId, session.user.id),
				isNull(warning.readAt),
			),
		)
		.returning();

	if (!updated) {
		return Response.json({ error: "Warning not found" }, { status: 404 });
	}

	return Response.json(updated);
}
