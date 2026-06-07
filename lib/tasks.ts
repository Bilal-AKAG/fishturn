export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
	id: string;
	title: string;
	description: string | null;
	status: TaskStatus;
	position: number;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTaskInput {
	title: string;
	description?: string;
	status?: TaskStatus;
}

export interface UpdateTaskInput {
	title?: string;
	description?: string;
	status?: TaskStatus;
	position?: number;
}

export interface ReorderUpdate {
	id: string;
	status: TaskStatus;
	position: number;
}

export async function fetchTasks(): Promise<Task[]> {
	const res = await fetch("/api/tasks");
	if (!res.ok) throw new Error("Failed to fetch tasks");
	return res.json();
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
	const res = await fetch("/api/tasks", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error("Failed to create task");
	return res.json();
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
	const res = await fetch(`/api/tasks/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error("Failed to update task");
	return res.json();
}

export async function deleteTask(id: string): Promise<void> {
	const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
	if (!res.ok) throw new Error("Failed to delete task");
}

export async function reorderTasks(updates: ReorderUpdate[]): Promise<void> {
	const res = await fetch("/api/tasks/reorder", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ updates }),
	});
	if (!res.ok) throw new Error("Failed to reorder tasks");
}
