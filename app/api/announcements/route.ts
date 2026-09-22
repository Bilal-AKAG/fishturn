import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { announcement, user } from "@/db/schema";

export interface AnnouncementDTO {
	id: string;
	title: string;
	message: string;
	createdBy: string;
	authorName: string | null;
	createdAt: string;
}

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

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
