export interface FeedbackEntry {
	id: string;
	message: string;
	category: "bug" | "feature" | "other" | null;
	userId: string | null;
	createdAt: string;
}

export async function fetchMyFeedback(): Promise<FeedbackEntry[]> {
	const res = await fetch("/api/feedback");
	if (!res.ok) throw new Error("Failed to fetch feedback");
	return res.json();
}

export async function submitFeedback(data: {
	message: string;
	category?: string;
}): Promise<FeedbackEntry> {
	const res = await fetch("/api/feedback", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error("Failed to submit feedback");
	return res.json();
}
