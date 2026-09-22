import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminKanbanBoard } from "@/components/kanban/admin-kanban-board"

async function AdminPageContent({
  userId,
}: {
  userId: string | undefined
}) {
  return (
    <section className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kanban</h2>
      </div>

      <div className="flex min-h-0 w-full flex-1 items-start justify-center overflow-auto">
        <AdminKanbanBoard userId={userId} />
      </div>
    </section>
  )
}

export default async function AdminPage(props: {
  searchParams: Promise<{ userId?: string }>
}) {
  const { userId } = await props.searchParams

  return (
    <Suspense
      fallback={
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex w-72 shrink-0 flex-col gap-2 rounded-xl border bg-muted/30 p-3"
            >
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          ))}
        </div>
      }
    >
      <AdminPageContent userId={userId} />
    </Suspense>
  )
}
