"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"
  const isUsernamePage = pathname === "/username"

  // dont show sidebar on login page or username page
  if (isLoginPage || isUsernamePage) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* comment trigger out until we have a mobile version */}
        {/* <SidebarTrigger /> */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
} 