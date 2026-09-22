"use client"

import * as React from "react"
import { MessageSquarePlusIcon } from "lucide-react"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function FeedbackDialog() {
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [category, setCategory] = React.useState("none")

  const mutation = useMutation({
    mutationFn: async (data: { message: string; category?: string }) => {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to submit feedback")
      return res.json()
    },
    onSuccess: () => {
      setMessage("")
      setCategory("none")
      setOpen(false)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    mutation.mutate({
      message: message.trim(),
      category: category === "none" ? undefined : category,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MessageSquarePlusIcon />
          <span className="sr-only">Send feedback</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-col gap-4 pt-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bug">Bug report</SelectItem>
                <SelectItem value="feature">Feature request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feedback-message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="feedback-message"
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              className="max-h-[40vh] min-w-0 resize-y overflow-y-auto break-words whitespace-normal"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || mutation.isPending}
            >
              {mutation.isPending ? "Sending…" : "Send feedback"}
            </Button>
          </div>

          {mutation.isSuccess && (
            <p className="text-center text-xs text-green-600 dark:text-green-500">
              Thanks for your feedback!
            </p>
          )}

          {mutation.isError && (
            <p className="text-center text-xs text-destructive">
              Something went wrong. Try again.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
