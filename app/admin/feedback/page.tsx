"use client"

import { useQuery } from "@tanstack/react-query"
import { MessageSquareIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminFeedbackEntry {
  id: string
  message: string
  category: "bug" | "feature" | "other" | null
  userId: string | null
  authorName: string | null
  authorEmail: string | null
  createdAt: string
}

async function fetchAllFeedback(): Promise<AdminFeedbackEntry[]> {
  const res = await fetch("/api/admin/feedback")
  if (!res.ok) throw new Error("Failed to fetch feedback")
  return res.json()
}

export default function AdminFeedbackPage() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: fetchAllFeedback,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquareIcon className="size-5" />
          Intern feedback
          {!isLoading && (
            <Badge variant="secondary" className="ml-1">
              {entries.length}
            </Badge>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything your interns have submitted, newest first.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No feedback yet — it will appear here once interns submit some.
          </p>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex flex-col gap-1.5 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {entry.authorName ?? entry.authorEmail ?? "Unknown intern"}
                    </span>
                    {entry.category && (
                      <Badge variant="secondary">{entry.category}</Badge>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{entry.message}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
