"use client"

import Link from "next/link"
import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
      title: "Monitoring",
      url: "/dashboard/monitoring",
      icon: IconChartBar,
    },
    {
      title: "Peers",
      url: "/dashboard/peers",
      icon: IconFolder,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = false, ...props }: AppSidebarProps) {
  // Menu untuk admin (hanya CRUD user)
  const adminNavMain = [
    {
      title: "User Management",
      url: "/admin/dashboard",
      icon: IconUsers,
    },
  ]

  // Menu untuk user (semua kecuali CRUD user)
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
      title: "Monitoring",
      url: "/dashboard/monitoring",
      icon: IconChartBar,
    },
    {
      title: "Peers",
      url: "/dashboard/peers",
      icon: IconFolder,
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
