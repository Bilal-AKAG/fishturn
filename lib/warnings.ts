import type { ManagedIntern } from "@/app/api/admin/interns/route";

export interface WarningItem {
	id: string;
	title: string;
	message: string;
	authorName: string | null;
	readAt: string | null;
	createdAt: string;
}

export interface AdminWarningItem extends WarningItem {
	userId: string;
	createdBy: string;
}

export async function fetchMyWarnings(): Promise<WarningItem[]> {
	const res = await fetch("/api/warnings");
	if (!res.ok) throw new Error("Failed to fetch warnings");
	return res.json();
}

export async function markWarningRead(id: string): Promise<WarningItem> {
	const res = await fetch(`/api/warnings/${id}/read`, { method: "POST" });
	if (!res.ok) throw new Error("Failed to mark warning as read");
	return res.json();
}

export async function fetchManagedInterns(): Promise<ManagedIntern[]> {
	const res = await fetch("/api/admin/interns");
	if (!res.ok) throw new Error("Failed to fetch interns");
	return res.json();
}

export async function deleteIntern(userId: string): Promise<void> {
	const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(body?.error ?? "Failed to delete user");
	}
}

export async function fetchAdminWarnings(userId?: string): Promise<AdminWarningItem[]> {
	const res = await fetch(
		userId ? `/api/admin/warnings?userId=${userId}` : "/api/admin/warnings",
	);
	if (!res.ok) throw new Error("Failed to fetch warnings");
	return res.json();
}

export async function sendWarning(data: {
	userId: string;
	title: string;
	message: string;
}): Promise<AdminWarningItem> {
	const res = await fetch("/api/admin/warnings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(body?.error ?? "Failed to send warning");
	}
	return res.json();
}

export async function retractWarning(id: string): Promise<void> {
	const res = await fetch(`/api/admin/warnings/${id}`, { method: "DELETE" });
	if (!res.ok) throw new Error("Failed to retract warning");
}
