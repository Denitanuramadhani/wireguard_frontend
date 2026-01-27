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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

interface AuditLog {
  action: string
  ldap_uid?: string
  performed_by: string
  created_at: string
  timestamp?: string
}

interface Device {
  device_id: number
  device_name: string
  vpn_ip: string
  status: string
  created_at: string
  last_seen?: string
  transfer_rx?: number
  transfer_tx?: number
  transfer_total?: number
}

function MonitoringContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get filter params from URL
  const actionFilterParam = searchParams.get('action') || ''
  const statusFilterParam = searchParams.get('status') || ''
  const actionFilter = actionFilterParam === 'all' ? '' : actionFilterParam
  const statusFilter = statusFilterParam === 'all' ? '' : statusFilterParam
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 50
  const offset = (page - 1) * limit

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [totalLogs, setTotalLogs] = useState(0)
  const [totalDevices, setTotalDevices] = useState(0)
  const [actionFilterValue, setActionFilterValue] = useState(actionFilterParam || 'all')
  const [statusFilterValue, setStatusFilterValue] = useState(statusFilterParam || 'all')

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadMonitoringData()
    }
  }, [user, actionFilter, statusFilter, page])

  const loadMonitoringData = async () => {
    try {
      setLoading(true)
      
      // Load audit logs with filters
      const auditResponse = await api.getUserAuditLogs(
        actionFilter || undefined,
        limit,
        offset
      ) as any
      const logsList = Array.isArray(auditResponse) ? auditResponse : (auditResponse.logs || [])
      setAuditLogs(logsList)
      setTotalLogs(auditResponse.total || auditResponse.count || logsList.length)
      
      // Load devices with filters
      const devicesResponse = await api.getUserDevicesMonitoring(
        statusFilter || undefined,
        limit,
        offset
      ) as any
      const devicesList = Array.isArray(devicesResponse) ? devicesResponse : (devicesResponse.devices || [])
      setDevices(devicesList)
      setTotalDevices(devicesResponse.total || devicesList.length)
    } catch (error: any) {
      toast.error(error.message || "Failed to load monitoring data")
      setAuditLogs([])
      setDevices([])
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = () => {
    const params = new URLSearchParams()
    if (actionFilterValue) params.set('action', actionFilterValue)
    if (statusFilterValue) params.set('status', statusFilterValue)
    if (page > 1) params.set('page', page.toString())
    router.push(`/dashboard/monitoring?${params.toString()}`)
  }

  const handleActionFilterChange = (value: string) => {
    setActionFilterValue(value)
    const params = new URLSearchParams()
    if (value && value !== "all") params.set('action', value)
    if (statusFilterParam && statusFilterParam !== "all") params.set('status', statusFilterParam)
    router.push(`/dashboard/monitoring?${params.toString()}`)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilterValue(value)
    const params = new URLSearchParams()
    if (actionFilterParam && actionFilterParam !== "all") params.set('action', actionFilterParam)
    if (value && value !== "all") params.set('status', value)
    router.push(`/dashboard/monitoring?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (actionFilterParam && actionFilterParam !== "all") params.set('action', actionFilterParam)
    if (statusFilterParam && statusFilterParam !== "all") params.set('status', statusFilterParam)
    params.set('page', newPage.toString())
    router.push(`/dashboard/monitoring?${params.toString()}`)
  }

  const auditColumns = [
    {
      accessorKey: "action",
      header: "Action",
    },
    {
      accessorKey: "ldap_uid",
      header: "User",
      cell: (row: any) => row.ldap_uid || row.performed_by || "-",
    },
    {
      accessorKey: "performed_by",
      header: "Performed By",
    },
    {
      accessorKey: "created_at",
      header: "Time",
      cell: (row: any) => {
        const dateStr = row.timestamp || row.created_at
        if (!dateStr) return "-"
        const date = new Date(dateStr)
        return date.toLocaleString()
      },
    },
  ]

  const deviceColumns = [
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
      accessorKey: "transfer_total",
      header: "Total Traffic",
      cell: (row: any) => {
        const bytes = row.transfer_total || 0
        if (bytes >= 1024 * 1024 * 1024) {
          return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
        } else if (bytes >= 1024 * 1024) {
          return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        } else if (bytes >= 1024) {
          return `${(bytes / 1024).toFixed(2)} KB`
        }
        return `${bytes} B`
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
  ]

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(totalLogs / limit)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" isAdmin={false} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>My Devices</CardTitle>
                    <CardDescription>Your registered devices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex gap-2">
                      <Select value={statusFilterValue} onValueChange={handleStatusFilterChange}>
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
                      columns={deviceColumns}
                      loading={loading}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                    <CardDescription>Your activity and changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex gap-2">
                      <Select value={actionFilterValue} onValueChange={handleActionFilterChange}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Actions</SelectItem>
                          <SelectItem value="device_added">Device Added</SelectItem>
                          <SelectItem value="device_revoked">Device Revoked</SelectItem>
                          <SelectItem value="login_success">Login Success</SelectItem>
                          <SelectItem value="login_failed">Login Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <SimpleTable 
                      data={auditLogs} 
                      columns={auditColumns}
                      loading={loading}
                    />
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Page {page} of {totalPages} ({totalLogs} total)
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                          >
                            <IconChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                          >
                            Next
                            <IconChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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

export default function MonitoringPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <MonitoringContent />
    </Suspense>
  )
}
