"use client"

import { HashIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button";
import { NavUser } from "./nav-user";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
 
const items = [
  {
    title: "general",
    url: "/general",
    icon: HashIcon,
  },
  {
    title: "about",
    url: "/about",
    icon: HashIcon,
  },
  {
    title: "help",
    url: "/help",
    icon: HashIcon,
  }
]
 
export function AppSidebar() {
  const pathname = usePathname()
  const user = useQuery(api.users.getCurrentUser);

  return (
    <Sidebar>
    <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <span className="text-base font-semibold">ircchat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupLabel>servers</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={isActive ? "bg-accent text-accent-foreground" : ""}
                    >
                      <Link href={item.url}>
                        <item.icon/>
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
      <SidebarFooter className="pb-4">
        <Authenticated>
          <NavUser user={{ username: user?.username || '', email: user?.email || '' }} />
        </Authenticated>
        <Unauthenticated>
          <Button asChild className="py-5">
                <Link href="/login" className="flex items-center justify-center">
                    <span className="font-semibold">log in</span>
                </Link>
            </Button>
        </Unauthenticated>
        <AuthLoading>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" disabled>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="ml-auto size-4 rounded" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </AuthLoading>
      </SidebarFooter>
    </Sidebar>
  )
}