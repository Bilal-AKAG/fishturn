"use client"

import { useQuery } from "@tanstack/react-query"
import { CircleCheckIcon, ListTodoIcon, MegaphoneIcon, TimerIcon } from "lucide-react"

import { useSession } from "@/lib/auth-client"
import { fetchTasks } from "@/lib/tasks"
import { fetchAnnouncements } from "@/lib/announcements"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string
  value: number
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </span>
        <div className="flex flex-col">
          {loading ? (
            <Skeleton className="h-6 w-10" />
          ) : (
            <span className="text-xl font-semibold tabular-nums">{value}</span>
          )}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  )
}

const STATUS_ROWS = [
  { id: "todo", label: "To do", barClass: "bg-slate-400" },
  { id: "in_progress", label: "In progress", barClass: "bg-amber-400" },
  { id: "done", label: "Done", barClass: "bg-emerald-400" },
] as const

function last7Days(): { key: string; label: string }[] {
  const days: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
    })
  }
  return days
}

export default function DashboardPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  })
  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  })

  const todo = tasks.filter((t) => t.status === "todo").length
  const inProgress = tasks.filter((t) => t.status === "in_progress").length
  const done = tasks.filter((t) => t.status === "done").length
  const total = tasks.length
  const completion = total === 0 ? 0 : Math.round((done / total) * 100)

  const counts: Record<string, number> = { todo, in_progress: inProgress, done }
  const maxCount = Math.max(1, todo, inProgress, done)

  const days = last7Days()
  const createdPerDay = days.map((d) => ({
    ...d,
    count: tasks.filter((t) => t.createdAt.slice(0, 10) === d.key).length,
  }))
  const maxDay = Math.max(1, ...createdPerDay.map((d) => d.count))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        {sessionPending ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1 className="text-2xl font-semibold tracking-tight">
            Hello, {session?.user?.name ?? "there"}
          </h1>
        )}
        <p className="text-sm text-muted-foreground">
          Here&apos;s your task overview and the latest announcements.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total tasks" value={total} icon={ListTodoIcon} loading={tasksLoading} />
        <StatCard label="To do" value={todo} icon={ListTodoIcon} loading={tasksLoading} />
        <StatCard label="In progress" value={inProgress} icon={TimerIcon} loading={tasksLoading} />
        <StatCard label="Done" value={done} icon={CircleCheckIcon} loading={tasksLoading} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by status</CardTitle>
            <CardDescription>Distribution across your kanban columns.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {tasksLoading ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : total === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks yet — create some on the Kanban page.
              </p>
            ) : (
              STATUS_ROWS.map((row) => (
                <div key={row.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {counts[row.id]} ({Math.round((counts[row.id] / total) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${row.barClass}`}
                      style={{ width: `${(counts[row.id] / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
            <div className="flex flex-col gap-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Completion</span>
                <span className="text-muted-foreground tabular-nums">{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Created this week</CardTitle>
            <CardDescription>Tasks created per day over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <div className="flex h-28 items-end gap-2">
                {createdPerDay.map((d) => (
                  <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {d.count > 0 ? d.count : ""}
                    </span>
                    <div className="flex h-20 w-full items-end rounded bg-muted/50">
                      <div
                        className="w-full rounded bg-primary/80"
                        style={{
                          height: d.count === 0 ? "4px" : `${Math.max(12, (d.count / maxDay) * 100)}%`,
                          opacity: d.count === 0 ? 0.3 : 1,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MegaphoneIcon className="size-4 text-muted-foreground" />
            <CardTitle>Announcements</CardTitle>
          </div>
          <CardDescription>Broadcasts from your admin.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {announcementsLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="flex flex-col gap-1 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{a.message}</p>
                {a.authorName && (
                  <Badge variant="secondary" className="w-fit">
                    {a.authorName}
                  </Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
