"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Building2,
  Receipt,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Megaphone,
  Ticket,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, canAccessModule } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/admin/applications", label: "Applications", icon: FileText, module: "applications" },
  { href: "/admin/halls", label: "Halls & Stands", icon: Building2, module: "halls" },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt, module: "invoices" },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, module: "payments" },
  { href: "/admin/placements", label: "Sponsored Placements", icon: Megaphone, module: "placements" },
  { href: "/admin/tickets", label: "Ticket Sales", icon: Ticket, module: "tickets" },
  { href: "/admin/analytics", label: "Web Analytics", icon: Activity, module: "analytics" },
  { href: "/admin/users", label: "Users & Roles", icon: Users, module: "users" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, module: "reports" },
  { href: "/admin/settings", label: "Settings", icon: Settings, module: "settings" },
]

interface AdminSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void
}

export function AdminSidebar({ onCollapseChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    onCollapseChange?.(collapsed)
  }, [collapsed, onCollapseChange])

  const filteredNavItems = navItems.filter((item) => user && canAccessModule(user.role, item.module))

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">Horti Logistica</span>
              <span className="text-xs text-sidebar-foreground/70">Africa Admin</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              const Icon = item.icon

              const navLink = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )

              return (
                <li key={item.href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    navLink
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>

        {/* Version Info */}
        {!collapsed && (
          <div className="border-t border-sidebar-border px-4 py-3">
            <p className="text-xs text-sidebar-foreground/50">Version 1.0.0</p>
            <p className="text-xs text-sidebar-foreground/50">© 2026 Horti Logistica</p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
