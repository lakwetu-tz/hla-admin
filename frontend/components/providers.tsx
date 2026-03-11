"use client"

import { type ReactNode } from "react"
import { ThemeProvider } from "@/lib/theme-context"
import QueryProvider from "@/providers/QueryProvider"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryProvider>
  )
}
