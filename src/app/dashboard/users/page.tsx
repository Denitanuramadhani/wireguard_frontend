"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SimpleTable } from "@/components/simple-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconShieldCheck, IconShieldX } from "@tabler/icons-react"
import { dummyUsers } from "@/lib/dummy-data"

export default function UsersPage() {
  // Using dummy data for preview
  const users = dummyUsers

  function handleToggleVPN(username: string, enabled: boolean) {
    toast.info("Toggle VPN functionality will be available after backend integration")
  }

  const columns = [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "wireguard_enabled",
      header: "VPN Access",
      cell: (row: any) => {
        const enabled = row.wireguard_enabled
        return (
          <Badge variant={enabled ? "default" : "secondary"}>
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "max_devices",
      header: "Max Devices",
    },
    {
      accessorKey: "device_count",
      header: "Active Devices",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (row: any) => {
        const enabled = row.wireguard_enabled
        return (
          <Button
            size="sm"
            variant={enabled ? "destructive" : "default"}
            onClick={() => handleToggleVPN(row.username, !enabled)}
          >
            {enabled ? (
              <>
                <IconShieldX className="h-4 w-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <IconShieldCheck className="h-4 w-4 mr-2" />
                Enable
              </>
            )}
          </Button>
        )
      },
    },
  ]

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <SimpleTable 
                  data={users} 
                  columns={columns}
                  loading={false}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
