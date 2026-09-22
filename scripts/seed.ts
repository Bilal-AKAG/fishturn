/**
 * Seed one admin user + five intern users, each intern with >= 10 tasks.
 *
 * Usage:
 *   bun run seed
 *   # or with custom credentials:
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=secret123 bun scripts/seed.ts
 *
 * The script is idempotent: existing users keep their id (roles are
 * enforced), and interns with fewer than 10 tasks are topped up to 10.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task, user } from "@/db/schema";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@fishturns.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Admin";

const INTERN_PASSWORD = process.env.SEED_INTERN_PASSWORD ?? "Intern123!";

const INTERNS = [
	{ name: "Default Intern", email: process.env.SEED_INTERN_EMAIL ?? "intern@fishturns.local" },
	{ name: "Amina Diallo", email: "amina.diallo@fishturns.local" },
	{ name: "Jonas Weber", email: "jonas.weber@fishturns.local" },
	{ name: "Sara Haddad", email: "sara.haddad@fishturns.local" },
	{ name: "Leo Martin", email: "leo.martin@fishturns.local" },
	{ name: "Nina Petrova", email: "nina.petrova@fishturns.local" },
];

const MIN_TASKS_PER_INTERN = 10;

const SAMPLE_TASKS: { title: string; description: string; status: "todo" | "in_progress" | "done" }[] = [
	{ title: "Read the onboarding guide", description: "Go through the team handbook and tooling setup.", status: "done" },
	{ title: "Set up local environment", description: "Install dependencies and run the app locally.", status: "done" },
	{ title: "Complete the product tour", description: "Click through every sidebar route and note questions.", status: "done" },
	{ title: "Build the dashboard graphs", description: "Task overview charts for the intern home page.", status: "in_progress" },
	{ title: "Implement task filters", description: "Add status and search filters to the kanban board.", status: "in_progress" },
	{ title: "Write API documentation", description: "Document the tasks and feedback endpoints.", status: "in_progress" },
	{ title: "Draft weekly update", description: "Summarize progress and blockers for review.", status: "todo" },
	{ title: "Review pull request", description: "Review a teammate's PR and leave feedback.", status: "todo" },
	{ title: "Fix login redirect bug", description: "Reproduce, fix, and verify the post-login redirect.", status: "todo" },
	{ title: "Prepare demo slides", description: "Five slides max for Friday's sprint review.", status: "todo" },
	{ title: "Add empty-state illustrations", description: "Design friendly empty states for lists.", status: "todo" },
	{ title: "Pair-programming session", description: "Shadow a senior on a real ticket.", status: "todo" },
];

async function ensureUser({
	email,
	password,
	name,
	role,
}: {
	email: string;
	password: string;
	name: string;
	role: "admin" | "user";
}) {
	const existing = await db.select().from(user).where(eq(user.email, email));

	if (existing.length > 0) {
		const current = existing[0];
		if (current.role !== role || !current.emailVerified) {
			await db
				.update(user)
				.set({ role, emailVerified: true, updatedAt: new Date() })
				.where(eq(user.email, email));
			console.log(`Updated ${email} -> role=${role}`);
		} else {
			console.log(`User already exists: ${email} (role=${role})`);
		}
		return current.id;
	}

	// Create via Better Auth so the password hash + account row are handled.
	const result = await auth.api.signUpEmail({
		body: { name, email, password },
	});
	const userId = (result as unknown as { user?: { id?: string } })?.user?.id;

	if (!userId) {
		throw new Error(`signUpEmail did not return a user id for ${email}`);
	}

	await db
		.update(user)
		.set({ role, emailVerified: true, updatedAt: new Date() })
		.where(eq(user.id, userId));

	console.log(`Created ${role}: ${email}`);
	return userId;
}

async function ensureInternTasks(internId: string, email: string) {
	const existing = await db
		.select({ status: task.status, position: task.position })
		.from(task)
		.where(eq(task.userId, internId));

	if (existing.length >= MIN_TASKS_PER_INTERN) {
		console.log(`Intern ${email} already has ${existing.length} task(s), skipping.`);
		return;
	}

	// Continue positions per status after the existing max.
	const maxPosition: Record<string, number> = {};
	for (const t of existing) {
		maxPosition[t.status] = Math.max(maxPosition[t.status] ?? -1, t.position);
	}

	const needed = MIN_TASKS_PER_INTERN - existing.length;
	for (let i = 0; i < needed; i++) {
		const sample = SAMPLE_TASKS[(existing.length + i) % SAMPLE_TASKS.length];
		maxPosition[sample.status] = (maxPosition[sample.status] ?? -1) + 1;
		await db.insert(task).values({
			id: crypto.randomUUID(),
			title: sample.title,
			description: sample.description,
			status: sample.status,
			position: maxPosition[sample.status],
			userId: internId,
		});
	}
	console.log(`Topped up ${email} with ${needed} task(s) (${existing.length} -> ${MIN_TASKS_PER_INTERN}).`);
}

const adminId = await ensureUser({
	email: ADMIN_EMAIL,
	password: ADMIN_PASSWORD,
	name: ADMIN_NAME,
	role: "admin",
});

const internIds: { email: string; id: string }[] = [];
for (const intern of INTERNS) {
	const id = await ensureUser({
		email: intern.email,
		password: INTERN_PASSWORD,
		name: intern.name,
		role: "user",
	});
	internIds.push({ email: intern.email, id });
}

for (const { email, id } of internIds) {
	await ensureInternTasks(id, email);
}

console.log("\nSeed complete:");
console.log(`  admin   : ${ADMIN_EMAIL} (id=${adminId})`);
for (const { email, id } of internIds) {
	console.log(`  intern  : ${email} (id=${id})`);
}
console.log(`  password for all seeded interns: ${INTERN_PASSWORD}`);
