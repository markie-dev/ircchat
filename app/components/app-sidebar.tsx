"use client";

import { HashIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NavUser } from "./nav-user";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar() {
  const pathname = usePathname();
  const user = useQuery(api.users.getCurrentUser);
  const channels = useQuery(api.channels.getChannels);

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <span className="text-base pl-1 font-semibold">ircchat</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-2">
          <SidebarGroupLabel>channels</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {channels
                ? channels.map((channel) => {
                    const isActive = pathname === `/c/${channel.name}`;
                    return (
                      <SidebarMenuItem key={channel.name}>
                        <SidebarMenuButton
                          asChild
                          className={
                            isActive
                              ? "bg-active-bg text-accent-foreground"
                              : ""
                          }
                        >
                          <Link href={`/c/${channel.name}`}>
                            <div className="flex items-center gap-2">
                              <HashIcon />
                              <span>{channel.name}</span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                : Array.from({ length: 5 }, (_, i) => {
                    const widths = ["w-16", "w-20", "w-12", "w-24", "w-18"];
                    return (
                      <SidebarMenuItem key={`skeleton-${i}`}>
                        <SidebarMenuButton disabled>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-sm" />
                            <Skeleton
                              className={`h-4 rounded-sm ${widths[i]}`}
                            />
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <Authenticated>
          <NavUser
            user={{ username: user?.username || "", email: user?.email || "" }}
          />
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
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </AuthLoading>
      </SidebarFooter>
    </Sidebar>
  );
}
