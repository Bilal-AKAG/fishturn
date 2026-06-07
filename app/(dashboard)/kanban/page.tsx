import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { KanbanBoard } from "@/components/kanban/kanban-board"

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  return (
    <section className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kanban</h2>
      </div>

      <div className="flex min-h-0 w-full flex-1 items-start justify-center overflow-auto">
        <KanbanBoard />
      </div>
    </section>
  )
}
