"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { CheckIcon, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

function initials(name: string, email: string) {
  const s = name || email
  return s
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(false)

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users")
      if (!res.ok) throw new Error("Failed to fetch users")
      return res.json()
    },
    staleTime: Infinity,
  })

  const selectedId = searchParams.get("userId") ?? users[0]?.id ?? ""
  const selected = users.find((u) => u.id === selectedId)

  React.useEffect(() => {
    if (!searchParams.has("userId") && users.length > 0) {
      router.replace(`/admin?userId=${users[0].id}`)
    }
  }, [users, searchParams, router])

  function onSelect(userId: string) {
    setOpen(false)
    router.push(`/admin?userId=${userId}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start gap-2 px-2"
        >
          {selected ? (
            <>
              <Avatar size="sm" className="size-6 shrink-0">
                <AvatarImage src={selected.image ?? ""} />
                <AvatarFallback>
                  {initials(selected.name ?? "", selected.email)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {selected.name ?? selected.email}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {selected.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
            </>
          ) : (
            <span className="text-muted-foreground">Select user…</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users…" />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {users.map((u) => (
                <CommandItem
                  key={u.id}
                  value={u.id}
                  onSelect={() => onSelect(u.id)}
                >
                  <Avatar size="sm" className="size-6 shrink-0">
                    <AvatarImage src={u.image ?? ""} />
                    <AvatarFallback>
                      {initials(u.name ?? "", u.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">
                    {u.name ?? u.email}
                  </span>
                  <CheckIcon
                    className={cn(
                      "ml-auto size-3.5 shrink-0",
                      selectedId === u.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
