"use client"

import { HashIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
 
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
} from "@/components/ui/sidebar"
 
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
    </Sidebar>
  )
}