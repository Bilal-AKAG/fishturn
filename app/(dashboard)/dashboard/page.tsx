"use client"

import { useSession } from "@/lib/auth-client"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { data: session, isPending } = useSession()

  return (
    <div className="flex flex-col gap-2">
      {isPending ? (
        <Skeleton className="h-8 w-48" />
      ) : (
        <h1 className="text-2xl font-semibold tracking-tight">
          Hello, {session?.user?.name ?? "there"} 👋
        </h1>
      )}
      <p className="text-sm text-muted-foreground">
        Welcome to your dashboard.
      </p>
    </div>
  )
}
