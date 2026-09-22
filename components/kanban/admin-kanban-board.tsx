"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import type { Task, TaskStatus } from "@/lib/tasks"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const COLUMNS = [
  { id: "todo" as TaskStatus, title: "To Do", dotClass: "bg-slate-400" },
  {
    id: "in_progress" as TaskStatus,
    title: "In Progress",
    dotClass: "bg-amber-400",
  },
  { id: "done" as TaskStatus, title: "Done", dotClass: "bg-emerald-400" },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

interface AdminKanbanBoardProps {
  userId: string | undefined
}

export function AdminKanbanBoard({ userId }: AdminKanbanBoardProps) {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["admin", "tasks", userId],
    queryFn: async () => {
      if (!userId) return []
      const res = await fetch(`/api/admin/users/${userId}/tasks`)
      if (!res.ok) throw new Error("Failed to fetch tasks")
      return res.json() as Promise<Task[]>
    },
    enabled: !!userId,
  })

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        No user selected.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex w-72 shrink-0 flex-col gap-2 rounded-xl border bg-muted/30 p-3"
          >
            <div className="flex items-center gap-2 px-0.5 py-1">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-6 rounded" />
            </div>
            {Array.from({ length: col.id === "in_progress" ? 2 : 3 }).map(
              (_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ),
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full items-stretch gap-4 overflow-x-auto pr-2">
      {COLUMNS.map((col) => {
        const colTasks = tasks
          .filter((t) => t.status === col.id)
          .sort((a, b) => a.position - b.position)

        return (
          <div
            key={col.id}
            className="flex h-[80vh] min-h-0 w-72 shrink-0 flex-col bg-muted/30"
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", col.dotClass)} />
                <span className="text-sm font-semibold tracking-tight">
                  {col.title}
                </span>
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 justify-center px-1.5 text-xs"
                >
                  {colTasks.length}
                </Badge>
              </div>
            </div>

            <div className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pt-0.5 pb-3">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-2 border-l-3 bg-card p-3 shadow-xs"
                >
                  <p className="text-sm leading-snug font-medium">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60">
                    {formatDate(task.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
