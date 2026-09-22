/**
 * Seed one admin user (+ one default intern user with sample tasks).
 *
 * Usage:
 *   bun scripts/seed.ts
 *   # or with custom credentials:
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=secret123 bun scripts/seed.ts
 *
 * The script is idempotent: if a user with the given email already exists,
 * it ensures the correct role instead of creating a duplicate.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task, user } from "@/db/schema";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@fishturns.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Admin";

const INTERN_EMAIL = process.env.SEED_INTERN_EMAIL ?? "intern@fishturns.local";
const INTERN_PASSWORD = process.env.SEED_INTERN_PASSWORD ?? "Intern123!";
const INTERN_NAME = process.env.SEED_INTERN_NAME ?? "Default Intern";

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

async function ensureInternTasks(internId: string) {
	const existing = await db.select({ id: task.id }).from(task).where(eq(task.userId, internId));
	if (existing.length > 0) {
		console.log(`Intern already has ${existing.length} task(s), skipping sample tasks.`);
		return;
	}

	const samples = [
		{ title: "Read the onboarding guide", description: "Go through the team handbook and tooling setup.", status: "done" as const },
		{ title: "Set up local environment", description: "Install dependencies and run the app locally.", status: "done" as const },
		{ title: "Build the dashboard graphs", description: "Task overview charts for the intern home page.", status: "in_progress" as const },
		{ title: "Draft weekly update", description: "Summarize progress and blockers for review.", status: "todo" as const },
	];

	for (let i = 0; i < samples.length; i++) {
		const s = samples[i];
		await db.insert(task).values({
			id: crypto.randomUUID(),
			title: s.title,
			description: s.description,
			status: s.status,
			position: i,
			userId: internId,
		});
	}
	console.log(`Created ${samples.length} sample tasks for the default intern.`);
}

const adminId = await ensureUser({
	email: ADMIN_EMAIL,
	password: ADMIN_PASSWORD,
	name: ADMIN_NAME,
	role: "admin",
});

const internId = await ensureUser({
	email: INTERN_EMAIL,
	password: INTERN_PASSWORD,
	name: INTERN_NAME,
	role: "user",
});

await ensureInternTasks(internId);

console.log("\nSeed complete:");
console.log(`  admin  : ${ADMIN_EMAIL} (id=${adminId})`);
console.log(`  intern : ${INTERN_EMAIL} (id=${internId})`);
