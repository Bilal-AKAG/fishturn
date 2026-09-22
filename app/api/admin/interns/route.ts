import { headers } from "next/headers";
import { and, count, desc, eq, isNull, ne } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task, user, warning } from "@/db/schema";

export interface ManagedIntern {
	id: string;
	name: string;
	email: string;
	image: string | null;
	createdAt: string;
	taskCount: number;
	todoCount: number;
	inProgressCount: number;
	doneCount: number;
	warningCount: number;
	unreadWarningCount: number;
}

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
	if ((session.user as { role?: string | null }).role !== "admin") {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const interns = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			createdAt: user.createdAt,
		})
		.from(user)
		.where(ne(user.role, "admin"))
		.orderBy(desc(user.createdAt));

	const result: ManagedIntern[] = await Promise.all(
		interns.map(async (intern) => {
			const byStatus = await db
				.select({ status: task.status, n: count() })
				.from(task)
				.where(eq(task.userId, intern.id))
				.groupBy(task.status);
			const statusCount = (s: string) => byStatus.find((r) => r.status === s)?.n ?? 0;

			const [{ n: warningCount }] = await db
				.select({ n: count() })
				.from(warning)
				.where(eq(warning.userId, intern.id));

			const [{ n: unreadWarningCount }] = await db
				.select({ n: count() })
				.from(warning)
				.where(and(eq(warning.userId, intern.id), isNull(warning.readAt)));

			return {
				id: intern.id,
				name: intern.name,
				email: intern.email,
				image: intern.image,
				createdAt:
					intern.createdAt instanceof Date
						? intern.createdAt.toISOString()
						: String(intern.createdAt),
				taskCount: statusCount("todo") + statusCount("in_progress") + statusCount("done"),
				todoCount: statusCount("todo"),
				inProgressCount: statusCount("in_progress"),
				doneCount: statusCount("done"),
				warningCount,
				unreadWarningCount,
			};
		}),
	);

	return Response.json(result);
}
