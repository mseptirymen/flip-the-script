"use client"

import * as React from "react"

import { NavMain } from "@/components/navigation/nav-main"
import { NavUser } from "@/components/navigation/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TrophyIcon, BarChartIcon, HexagonIcon } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

const data = {
  navMain: [
    {
      title: "Tournaments",
      url: "/tournaments",
      icon: <TrophyIcon />,
      isActive: true,
    },
    {
      title: "Stats",
      url: "#",
      icon: <BarChartIcon />,
    },
  ],
  navDeck: [
    {
      title: "Deck Builder",
      url: "/deck",
      icon: <HexagonIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = {
    name: user?.email?.split("@")[0] || "Guest",
    email: user?.email || "",
    avatar: "/avatars/1.png",
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TrophyIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Flip the Script</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.navDeck} label="Deck" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
