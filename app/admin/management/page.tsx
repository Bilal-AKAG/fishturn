"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ShieldAlertIcon, Trash2Icon, TriangleAlertIcon, UsersIcon } from "lucide-react"

import type { ManagedIntern } from "@/app/api/admin/interns/route"
import {
  deleteIntern,
  fetchAdminWarnings,
  fetchManagedInterns,
  retractWarning,
  sendWarning,
} from "@/lib/warnings"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

function initials(name: string, email: string) {
  return (name || email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function WarnDialog({
  intern,
  open,
  onOpenChange,
}: {
  intern: ManagedIntern
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = React.useState("")
  const [message, setMessage] = React.useState("")

  const { data: warnings = [], isLoading } = useQuery({
    queryKey: ["admin", "warnings", intern.id],
    queryFn: () => fetchAdminWarnings(intern.id),
    enabled: open,
  })

  const sendMutation = useMutation({
    mutationFn: sendWarning,
    onSuccess: () => {
      setTitle("")
      setMessage("")
      queryClient.invalidateQueries({ queryKey: ["admin", "warnings"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "interns"] })
    },
  })

  const retractMutation = useMutation({
    mutationFn: retractWarning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "warnings"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "interns"] })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-0 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Warn {intern.name}</DialogTitle>
          <DialogDescription>
            The intern sees this warning on their home page and warnings page
            until they acknowledge it.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim() || !message.trim()) return
            sendMutation.mutate({
              userId: intern.id,
              title: title.trim(),
              message: message.trim(),
            })
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`warn-title-${intern.id}`}>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`warn-title-${intern.id}`}
              placeholder="e.g. Missed standup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`warn-message-${intern.id}`}>
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`warn-message-${intern.id}`}
              placeholder="What needs to change?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            {sendMutation.isError && (
              <p className="mr-auto text-xs text-destructive">
                {sendMutation.error.message}
              </p>
            )}
            <Button
              type="submit"
              disabled={!title.trim() || !message.trim() || sendMutation.isPending}
            >
              {sendMutation.isPending ? "Sending…" : "Send warning"}
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-2 border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            Previous warnings ({warnings.length})
          </p>
          {isLoading ? (
            <Skeleton className="h-14 w-full" />
          ) : warnings.length === 0 ? (
            <p className="text-xs text-muted-foreground">None yet.</p>
          ) : (
            warnings.map((w) => (
              <div
                key={w.id}
                className="flex items-start gap-2 rounded-lg border p-2.5"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-xs font-medium">
                    {w.title}{" "}
                    {w.readAt ? (
                      <Badge variant="secondary" className="ml-1">
                        read
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-1">
                        unread
                      </Badge>
                    )}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {w.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Retract warning"
                  disabled={retractMutation.isPending}
                  onClick={() => retractMutation.mutate(w.id)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({
  intern,
  open,
  onOpenChange,
}: {
  intern: ManagedIntern
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => deleteIntern(intern.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "interns"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove {intern.name}?</DialogTitle>
          <DialogDescription>
            This permanently deletes {intern.email} along with their{" "}
            {intern.taskCount} task(s), feedback, and warnings. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {mutation.isError && (
          <p className="text-xs text-destructive">{mutation.error.message}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Removing…" : "Remove intern"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminManagementPage() {
  const { data: interns = [], isLoading } = useQuery({
    queryKey: ["admin", "interns"],
    queryFn: fetchManagedInterns,
  })
  const [warnTarget, setWarnTarget] = React.useState<ManagedIntern | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<ManagedIntern | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <UsersIcon className="size-5" />
          Management
          {!isLoading && (
            <Badge variant="secondary" className="ml-1">
              {interns.length}
            </Badge>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          Remove interns from the platform or send them warnings.
        </p>
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </>
      ) : interns.length === 0 ? (
        <p className="text-sm text-muted-foreground">No interns on the platform.</p>
      ) : (
        interns.map((intern) => (
          <Card key={intern.id}>
            <CardContent className="flex flex-wrap items-center gap-3 pt-4">
              <Avatar className="size-10">
                <AvatarImage src={intern.image ?? ""} />
                <AvatarFallback>{initials(intern.name, intern.email)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-sm font-medium">{intern.name}</p>
                <p className="truncate text-xs text-muted-foreground">{intern.email}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" title="Tasks: to do / in progress / done">
                  {intern.taskCount} tasks · {intern.todoCount}/{intern.inProgressCount}/
                  {intern.doneCount}
                </Badge>
                {intern.warningCount > 0 && (
                  <Badge
                    variant={intern.unreadWarningCount > 0 ? "destructive" : "secondary"}
                    title="Warnings (unread)"
                  >
                    <TriangleAlertIcon className="size-3" />
                    {intern.warningCount}
                    {intern.unreadWarningCount > 0 && ` (${intern.unreadWarningCount} unread)`}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWarnTarget(intern)}
                >
                  <ShieldAlertIcon />
                  Warn
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${intern.name}`}
                  onClick={() => setDeleteTarget(intern)}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {warnTarget && (
        <WarnDialog
          intern={warnTarget}
          open={!!warnTarget}
          onOpenChange={(open) => !open && setWarnTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          intern={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
