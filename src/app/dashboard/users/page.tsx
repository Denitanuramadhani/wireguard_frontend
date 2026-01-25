"use client"

import { useState, useEffect } from "react"
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
import { api } from "@/lib/api"

interface User {
  username: string
  wireguard_enabled: boolean
  max_devices: number
  device_count: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await api.getAdminUsers()
      setUsers(response.users || [])
    } catch (error: any) {
      toast.error(error.message || "Failed to load users")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleVPN(username: string, enabled: boolean) {
    try {
      if (enabled) {
        await api.enableUserVPN(username)
        toast.success("VPN access enabled for user")
      } else {
        await api.disableUserVPN(username)
        toast.success("VPN access disabled for user")
      }
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle VPN access")
    }
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
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
