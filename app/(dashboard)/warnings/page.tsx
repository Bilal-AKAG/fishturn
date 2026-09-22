"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CircleCheckIcon, TriangleAlertIcon } from "lucide-react"

import { fetchMyWarnings, markWarningRead } from "@/lib/warnings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function WarningsPage() {
  const queryClient = useQueryClient()
  const { data: warnings = [], isLoading } = useQuery({
    queryKey: ["warnings"],
    queryFn: fetchMyWarnings,
  })

  const readMutation = useMutation({
    mutationFn: markWarningRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warnings"] })
    },
  })

  const unread = warnings.filter((w) => !w.readAt)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <TriangleAlertIcon className="size-6" />
          Warnings
          {!isLoading && unread.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {unread.length} unread
            </Badge>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          Notices from your admin. Acknowledge each one once you&apos;ve read it.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : warnings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No warnings — keep up the good work.
          </p>
        ) : (
          warnings.map((w) => (
            <Card
              key={w.id}
              className={w.readAt ? "opacity-70" : "border-destructive/40"}
            >
              <CardContent className="flex items-start gap-3 pt-4">
                <TriangleAlertIcon
                  className={`mt-0.5 size-4 shrink-0 ${w.readAt ? "text-muted-foreground" : "text-destructive"}`}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{w.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(w.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{w.message}</p>
                  {w.authorName && (
                    <p className="text-[11px] text-muted-foreground">
                      From {w.authorName}
                    </p>
                  )}
                </div>
                {!w.readAt && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={readMutation.isPending}
                    onClick={() => readMutation.mutate(w.id)}
                  >
                    <CircleCheckIcon />
                    Acknowledge
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
