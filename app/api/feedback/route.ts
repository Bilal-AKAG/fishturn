import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { feedback } from "@/db/schema";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const entries = await db
		.select()
		.from(feedback)
		.where(eq(feedback.userId, session.user.id))
		.orderBy(desc(feedback.createdAt));

	return Response.json(entries);
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { message, category } = body;

	if (!message?.trim()) {
		return Response.json({ error: "Message is required" }, { status: 400 });
	}

	const [entry] = await db
		.insert(feedback)
		.values({
			id: crypto.randomUUID(),
			message: message.trim(),
			category: category || null,
			userId: session.user.id,
		})
		.returning();

	return Response.json(entry, { status: 201 });
}
