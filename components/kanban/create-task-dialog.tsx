"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import type { TaskStatus } from "@/lib/tasks"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateTaskDialogProps {
  status: TaskStatus
  onCreateTask: (title: string, description?: string) => void
  isLoading?: boolean
}

export function CreateTaskDialog({
  onCreateTask,
  isLoading,
}: CreateTaskDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onCreateTask(title.trim(), description.trim() || undefined)
    setTitle("")
    setDescription("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <PlusIcon />
          <span className="sr-only">Add task</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-col gap-4 pt-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              className="min-w-0 overflow-x-auto break-words"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="task-description"
              placeholder="Add more detail…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="max-h-[40vh] min-w-0 resize-y overflow-y-auto break-words whitespace-normal"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isLoading}>
              Create task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
