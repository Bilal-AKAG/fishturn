"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Task, TaskStatus } from "@/lib/tasks"
import { createTask, fetchTasks, reorderTasks } from "@/lib/tasks"
import { Skeleton } from "@/components/ui/skeleton"
import { KanbanCard } from "./kanban-card"
import { KanbanColumn } from "./kanban-column"

const TASKS_KEY = ["tasks"] as const

const COLUMNS = [
  { id: "todo" as TaskStatus, title: "To Do", dotClass: "bg-slate-400" },
  {
    id: "in_progress" as TaskStatus,
    title: "In Progress",
    dotClass: "bg-amber-400",
  },
  { id: "done" as TaskStatus, title: "Done", dotClass: "bg-emerald-400" },
]

const COLUMN_IDS = new Set<string>(["todo", "in_progress", "done"])

/** Reassign sequential positions within each column based on array order. */
function applyPositions(tasks: Task[]): Task[] {
  const result = [...tasks]
  for (const col of COLUMNS) {
    const colTasks = result.filter((t) => t.status === col.id)
    colTasks.forEach((t, idx) => {
      const i = result.findIndex((r) => r.id === t.id)
      if (i >= 0) result[i] = { ...t, position: idx }
    })
  }
  return result
}

function KanbanSkeleton() {
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
            )
          )}
        </div>
      ))}
    </div>
  )
}

export function KanbanBoard() {
  const queryClient = useQueryClient()

  // ── Local drag state ────────────────────────────────────────────────────────
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  // localTasks drives the board display; synced from server when not dragging.
  const [localTasks, _setLocalTasks] = React.useState<Task[]>([])
  const localTasksRef = React.useRef<Task[]>([])

  function setLocalTasks(updater: Task[] | ((prev: Task[]) => Task[])) {
    _setLocalTasks((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      localTasksRef.current = next
      return next
    })
  }

  // ── Server state ────────────────────────────────────────────────────────────
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: TASKS_KEY,
    queryFn: fetchTasks,
  })

  const prevTasksRef = React.useRef<Task[] | null>(null)
  const wasDraggingRef = React.useRef<boolean>(false)

  React.useEffect(() => {
    const sorted = [...tasks].sort((a, b) => a.position - b.position)

    // shallow comparison based on id/status/position
    const sameAsPrev =
      !!prevTasksRef.current &&
      prevTasksRef.current.length === sorted.length &&
      prevTasksRef.current.every(
        (t, i) =>
          t.id === sorted[i].id &&
          t.status === sorted[i].status &&
          t.position === sorted[i].position
      )

    if (!isDragging) {
      // If we were dragging, always sync back to server-sorted state.
      if (wasDraggingRef.current || !sameAsPrev) {
        setLocalTasks(sorted)
        prevTasksRef.current = sorted
      }
    }

    wasDraggingRef.current = isDragging
  }, [tasks, isDragging])

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createTask,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const prev = queryClient.getQueryData<Task[]>(TASKS_KEY)
      const colTasks = (prev ?? []).filter(
        (t) => t.status === (input.status ?? "todo")
      )
      const optimistic: Task = {
        id: `temp-${crypto.randomUUID()}`,
        title: input.title,
        description: input.description ?? null,
        status: (input.status ?? "todo") as TaskStatus,
        position: colTasks.length,
        userId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) => [
        ...(old ?? []),
        optimistic,
      ])
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(TASKS_KEY, ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })

  const reorderMutation = useMutation({ mutationFn: reorderTasks })

  // ── DnD sensors ─────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const activeTask = localTasks.find((t) => t.id === activeId) ?? null

  // ── Drag handlers ────────────────────────────────────────────────────────────
  function onDragStart({ active }: DragStartEvent) {
    setIsDragging(true)
    setActiveId(active.id as string)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const aid = active.id as string
    const oid = over.id as string
    if (aid === oid) return

    setLocalTasks((prev) => {
      const aIdx = prev.findIndex((t) => t.id === aid)
      if (aIdx === -1) return prev

      const aTask = prev[aIdx]
      const overIsCol = COLUMN_IDS.has(oid)
      const oIdx = overIsCol ? -1 : prev.findIndex((t) => t.id === oid)
      const targetStatus: TaskStatus = overIsCol
        ? (oid as TaskStatus)
        : oIdx >= 0
          ? (prev[oIdx].status as TaskStatus)
          : (aTask.status as TaskStatus)

      // Remove active task from its current slot.
      const without = prev.filter((t) => t.id !== aid)

      if (overIsCol || oIdx === -1) {
        // Append to the end of the target column.
        return [...without, { ...aTask, status: targetStatus }]
      }

      // Insert just before the over-task.
      const newOIdx = without.findIndex((t) => t.id === oid)
      const result = [...without]
      result.splice(newOIdx, 0, { ...aTask, status: targetStatus })
      return result
    })
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setIsDragging(false)
    setActiveId(null)

    if (!over) {
      // Cancelled — reset to last known server state.
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
      return
    }

    // Compute canonical positions from the current local order.
    const positioned = applyPositions(localTasksRef.current)

    // Diff against server state to find what actually changed.
    const serverTasks = queryClient.getQueryData<Task[]>(TASKS_KEY) ?? []
    const updates = positioned
      .filter((lt) => {
        const orig = serverTasks.find((t) => t.id === lt.id)
        return (
          orig && (orig.status !== lt.status || orig.position !== lt.position)
        )
      })
      .map(({ id, status, position }) => ({ id, status, position }))

    if (updates.length === 0) return

    // Snapshot for rollback.
    const snapshot = [...serverTasks]

    // Optimistically apply to cache so the board stays in sync.
    queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
      (old ?? []).map((t) => {
        const u = updates.find((u) => u.id === t.id)
        return u ? { ...t, ...u } : t
      })
    )

    reorderMutation.mutate(updates, {
      onError: () => queryClient.setQueryData(TASKS_KEY, snapshot),
      onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
  }

  function onDragCancel() {
    setIsDragging(false)
    setActiveId(null)
    queryClient.invalidateQueries({ queryKey: TASKS_KEY })
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (isLoading) return <KanbanSkeleton />

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex h-full min-h-0 w-full items-stretch gap-4 overflow-x-auto pr-2">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={localTasks.filter((t) => t.status === col.id)}
            onCreateTask={(title, description) =>
              createMutation.mutate({ title, description, status: col.id })
            }
            isCreating={createMutation.isPending}
          />
        ))}
      </div>

      {/* Ghost card shown under the pointer while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
