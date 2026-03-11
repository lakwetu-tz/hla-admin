"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider } from "@/lib/auth-context"
import { useAuthStore } from "@/store/authStore"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Breadcrumbs } from "@/components/admin/breadcrumbs"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar onCollapseChange={setSidebarCollapsed} />
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300",
            sidebarCollapsed ? "pl-16" : "pl-16 lg:pl-64"
          )}
        >
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}
