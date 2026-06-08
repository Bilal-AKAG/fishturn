"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { GripVerticalIcon, Trash2Icon } from "lucide-react"

import type { Task } from "@/lib/tasks"
import { deleteTask } from "@/lib/tasks"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const TASKS_KEY = ["tasks"] as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

interface KanbanCardProps {
  task: Task
  isOverlay?: boolean
}

export function KanbanCard({ task, isOverlay = false }: KanbanCardProps) {
  const queryClient = useQueryClient()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const prev = queryClient.getQueryData<Task[]>(TASKS_KEY)
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
        (old ?? []).filter((t) => t.id !== task.id)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(TASKS_KEY, ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col gap-2 border-l-3  bg-card p-3",
        "shadow-xs transition-shadow hover:shadow-sm",
        isDragging && "opacity-40",
        isOverlay && "rotate-1 cursor-grabbing opacity-95 shadow-lg"
      )}
    >
      {/* Drag handle + delete row */}
      <div className="flex items-start justify-between">
        <button
          className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/40 transition-colors hover:text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag task"
          tabIndex={-1}
        >
          <GripVerticalIcon className="size-3.5" />
        </button>

        <p className="flex-1 text-sm leading-snug font-medium">{task.title}</p>

        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            deleteMutation.mutate()
          }}
          disabled={deleteMutation.isPending}
          aria-label="Delete task"
        >
          <Trash2Icon />
        </Button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground/60">
        {formatDate(task.createdAt)}
      </p>
    </div>
  )
}
