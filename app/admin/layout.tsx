import { redirect } from "next/navigation";

import { isAdmin, requireSession } from "@/lib/admin-guard";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { QueryProvider } from "@/lib/query-provider"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authoritative guard: only admins may access /admin.
  const session = await requireSession()
  if (!session) redirect("/login?redirect=/admin")
  if (!isAdmin(session)) redirect("/dashboard")

  return (
    <QueryProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <main className="flex min-h-0 flex-1 flex-col p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  )
}
