"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { KanbanSquareIcon, MegaphoneIcon, MessageSquareIcon } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { UserSelect } from "@/components/admin/user-select"
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
  { title: "Kanban", href: "/admin", icon: KanbanSquareIcon },
  { title: "Announcements", href: "/admin/announcements", icon: MegaphoneIcon },
  { title: "Feedback", href: "/admin/feedback", icon: MessageSquareIcon },
]

export function AdminSidebar() {
  const pathname = usePathname()

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
        <UserSelect />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
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
