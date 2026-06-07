"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

import type { Task, TaskStatus } from "@/lib/tasks"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CreateTaskDialog } from "./create-task-dialog"
import { KanbanCard } from "./kanban-card"

interface ColumnDef {
  id: TaskStatus
  title: string
  dotClass: string
}

interface KanbanColumnProps {
  column: ColumnDef
  tasks: Task[]
  onCreateTask: (title: string, description?: string) => void
  isCreating: boolean
}

export function KanbanColumn({
  column,
  tasks,
  onCreateTask,
  isCreating,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      className={cn(
        "flex h-[80vh] min-h-0 w-72 shrink-0 flex-col bg-muted/30 transition-colors duration-150",
        isOver && "bg-muted/60 ring-2  ring-inset"
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", column.dotClass)} />
          <span className="text-sm font-semibold tracking-tight">
            {column.title}
          </span>
          <Badge
            variant="secondary"
            className="h-5 min-w-5 justify-center px-1.5 text-xs"
          >
            {tasks.length}
          </Badge>
        </div>

        <CreateTaskDialog
          status={column.id}
          onCreateTask={onCreateTask}
          isLoading={isCreating}
        />
      </div>

      {/* Drop zone + cards */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pt-0.5 pb-3"
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
