"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SimpleTable } from "@/components/simple-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { IconTrash } from "@tabler/icons-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

function AdminDevicesContent() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const statusFilterParam = searchParams.get('status') || ''
  const statusFilter = statusFilterParam === 'all' ? '' : statusFilterParam
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 100
  const offset = (page - 1) * limit

  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/dashboard')
      }
    }
  }, [user, authLoading, isAdmin, router])

  useEffect(() => {
    if (user && isAdmin) {
      loadDevices()
    }
  }, [user, isAdmin, statusFilter, page])

  const loadDevices = async () => {
    try {
      setLoading(true)
      const response = await api.getAdminDevices(statusFilter || undefined, limit, offset) as any
      const devicesList = Array.isArray(response) ? response : (response.devices || [])
      setDevices(devicesList)
      setTotal(response.count || devicesList.length)
    } catch (error: any) {
      toast.error(error.message || "Failed to load devices")
      setDevices([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilterChange = (value: string) => {
    const params = new URLSearchParams()
    if (value && value !== "all") {
      params.set('status', value)
    }
    router.push(`/admin/devices?${params.toString()}`)
  }

  const handleRevokeDevice = async (deviceId: number) => {
    if (!confirm("Are you sure you want to revoke this device?")) {
      return
    }

    try {
      await api.revokeAdminDevice(deviceId)
      toast.success("Device revoked successfully")
      loadDevices()
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke device")
    }
  }

  const columns = [
    {
      accessorKey: "device_id",
      header: "ID",
    },
    {
      accessorKey: "ldap_uid",
      header: "User",
    },
    {
      accessorKey: "device_name",
      header: "Device Name",
    },
    {
      accessorKey: "vpn_ip",
      header: "VPN IP",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row: any) => {
        const status = row.status
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: (row: any) => {
        const date = new Date(row.created_at)
        return date.toLocaleDateString()
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (row: any) => {
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleRevokeDevice(row.device_id)}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" isAdmin={true} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Devices</CardTitle>
                    <CardDescription>Manage all VPN devices in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Select value={statusFilterParam || "all"} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="revoked">Revoked</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <SimpleTable 
                      data={devices} 
                      columns={columns}
                      loading={loading}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AdminDevicesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AdminDevicesContent />
    </Suspense>
  )
}
