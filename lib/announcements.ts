export interface Announcement {
	id: string;
	title: string;
	message: string;
	createdBy: string;
	authorName: string | null;
	createdAt: string;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
	const res = await fetch("/api/announcements");
	if (!res.ok) throw new Error("Failed to fetch announcements");
	return res.json();
}

export async function createAnnouncement(data: {
	title: string;
	message: string;
}): Promise<Announcement> {
	const res = await fetch("/api/admin/announcements", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error("Failed to create announcement");
	return res.json();
}

export async function deleteAnnouncement(id: string): Promise<void> {
	const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
	if (!res.ok) throw new Error("Failed to delete announcement");
}
