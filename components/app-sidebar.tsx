"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  HouseIcon,
  KanbanSquareIcon,
  MessageSquareIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { fetchMyWarnings } from "@/lib/warnings"
import { NavUser } from "@/components/nav-user"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Home", href: "/dashboard", icon: HouseIcon },
  { title: "Kanban", href: "/kanban", icon: KanbanSquareIcon },
  { title: "Feedback", href: "/feedback", icon: MessageSquareIcon },
  { title: "Warnings", href: "/warnings", icon: TriangleAlertIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: warnings = [] } = useQuery({
    queryKey: ["warnings"],
    queryFn: fetchMyWarnings,
  })
  const unreadCount = warnings.filter((w) => !w.readAt).length

  // Pick the nav item with the longest matching prefix of the pathname
  const active = navItems.reduce<null | { href: string }>((best, item) => {
    if (pathname === item.href) return item
    if (
      pathname.startsWith(item.href) &&
      item.href.length > (best?.href?.length ?? 0)
    )
      return item
    return best
  }, null)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-xs font-bold">FT</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">FishTurns</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = active?.href === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      aria-current={isActive ? "page" : undefined}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.href === "/warnings" && unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto h-5 min-w-5 justify-center px-1.5 text-xs"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
