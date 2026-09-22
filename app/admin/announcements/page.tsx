"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MegaphoneIcon, Trash2Icon } from "lucide-react"

import {
  createAnnouncement,
  deleteAnnouncement,
  type Announcement,
} from "@/lib/announcements"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

async function fetchAdminAnnouncements(): Promise<Announcement[]> {
  const res = await fetch("/api/admin/announcements")
  if (!res.ok) throw new Error("Failed to fetch announcements")
  return res.json()
}

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient()
  const [title, setTitle] = React.useState("")
  const [message, setMessage] = React.useState("")

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: fetchAdminAnnouncements,
  })

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      setTitle("")
      setMessage("")
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] })
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] })
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    createMutation.mutate({ title: title.trim(), message: message.trim() })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <MegaphoneIcon className="size-5" />
          Announcements
        </h1>
        <p className="text-sm text-muted-foreground">
          Broadcast a message — it shows on every intern&apos;s home page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New announcement</CardTitle>
          <CardDescription>Visible to all interns on their home page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="announcement-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="announcement-title"
                placeholder="e.g. Sprint review on Friday"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="announcement-message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="announcement-message"
                placeholder="What should the interns know?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              {createMutation.isError && (
                <p className="mr-auto text-xs text-destructive">
                  Something went wrong. Try again.
                </p>
              )}
              <Button
                type="submit"
                disabled={!title.trim() || !message.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Broadcasting…" : "Broadcast"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start gap-3 pt-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
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
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete announcement"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(a.id)}
                >
                  <Trash2Icon />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
