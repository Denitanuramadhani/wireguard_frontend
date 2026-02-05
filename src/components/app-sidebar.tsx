"use client"

import Link from "next/link"
import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconDownload,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  IconUsers,
  IconShield,
  IconFileAnalytics,
  IconUser,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navSecondary = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = false, ...props }: AppSidebarProps) {
  // Menu untuk admin (semua menu admin yang pakai endpoint /admin)
  const adminNavMain = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "User Management",
      url: "/admin/dashboard",
      icon: IconUsers,
    },
    {
      title: "Devices",
      url: "/admin/devices",
      icon: IconListDetails,
    },
    {
      title: "Monitoring",
      url: "/admin/monitoring",
      icon: IconChartBar,
    },
    {
      title: "Bandwidth",
      url: "/admin/bandwidth",
      icon: IconFileAnalytics,
    },
  ]

  // Menu untuk user biasa (tidak pakai endpoint /admin)
  const userNavMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Devices",
      url: "/dashboard/devices",
      icon: IconListDetails,
    },
    {
      title: "Downloads",
      url: "/dashboard/downloads",
      icon: IconDownload,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: IconUser,
    },
    {
      title: "Peers",
      url: "/dashboard/peers",
      icon: IconFolder,
    },
    {
      title: "Monitoring",
      url: "/dashboard/monitoring",
      icon: IconChartBar,
    },
  ]

  const navMain = isAdmin ? adminNavMain : userNavMain
  const dashboardUrl = isAdmin ? "/admin/dashboard" : "/dashboard"

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={dashboardUrl}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">WireGuard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
