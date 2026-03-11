"use client"

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from "react"
import { useAuthStore } from "@/store/authStore"

export type UserRole = "super_admin" | "event_manager" | "finance_manager" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  lastLogin: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: storeUser, isAuthenticated: storeAuthenticated, logout: storeLogout } = useAuthStore()
  const [user, setUser] = useState<User | null>(null)

  // Sync the legacy context state with the new Zustand store
  useEffect(() => {
    if (storeAuthenticated && storeUser) {
      // The backend returns user.roles as an array. We pick the first one.
      const userRole = (storeUser.roles && storeUser.roles.length > 0)
        ? storeUser.roles[0]
        : (storeUser as any).role || "admin";

      setUser({
        id: storeUser.id,
        email: storeUser.email,
        name: storeUser.name,
        role: userRole as UserRole,
        lastLogin: new Date().toISOString()
      })
    } else {
      setUser(null)
    }
  }, [storeUser, storeAuthenticated])

  const login = async () => true

  const logout = useCallback(() => {
    storeLogout()
    // Hard redirect to clear all state and cookies
    window.location.href = '/'
  }, [storeLogout])

  const switchRole = (role: UserRole) => {
    if (user) setUser({ ...user, role })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function canAccessModule(role: UserRole, module: string): boolean {
  const permissions: Record<string, string[]> = {
    super_admin: ["dashboard", "applications", "halls", "invoices", "payments", "users", "reports", "settings", "placements", "tickets", "analytics"],
    event_manager: ["dashboard", "applications", "halls", "reports", "tickets"],
    finance_manager: ["dashboard", "applications", "invoices", "payments", "reports", "placements", "tickets", "analytics"],
    admin: ["dashboard"]
  }
  return permissions[role]?.includes(module) ?? false
}
