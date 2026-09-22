"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchMyFeedback, submitFeedback } from "@/lib/feedback"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

export default function FeedbackPage() {
  const queryClient = useQueryClient()
  const [message, setMessage] = React.useState("")
  const [category, setCategory] = React.useState("none")

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["feedback", "mine"],
    queryFn: fetchMyFeedback,
  })

  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      setMessage("")
      setCategory("none")
      queryClient.invalidateQueries({ queryKey: ["feedback", "mine"] })
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Report bugs, request features, or share anything else with your admin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send feedback</CardTitle>
          <CardDescription>It will be visible to you and your admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:max-w-xs">
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

            <div className="flex items-center justify-end gap-2">
              {mutation.isSuccess && (
                <p className="mr-auto text-xs text-green-600 dark:text-green-500">
                  Thanks for your feedback!
                </p>
              )}
              {mutation.isError && (
                <p className="mr-auto text-xs text-destructive">
                  Something went wrong. Try again.
                </p>
              )}
              <Button type="submit" disabled={!message.trim() || mutation.isPending}>
                {mutation.isPending ? "Sending…" : "Send feedback"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your feedback</CardTitle>
          <CardDescription>Everything you&apos;ve submitted so far.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback yet.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-1 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  {entry.category ? (
                    <Badge variant="secondary">{entry.category}</Badge>
                  ) : (
                    <span />
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm">{entry.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
