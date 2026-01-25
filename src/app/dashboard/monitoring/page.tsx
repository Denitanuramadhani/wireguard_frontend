"use client"

import { useState, useEffect } from "react"
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
import { IconAlertCircle, IconInfoCircle, IconAlertTriangle, IconX } from "@tabler/icons-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Alert {
  severity: string
  message: string
  timestamp: string
}

interface AuditLog {
  action: string
  ldap_uid: string
  performed_by: string
  timestamp: string
}

interface SystemStats {
  devices?: {
    total: number
    active: number
    revoked: number
    expired: number
  }
  users?: {
    total_with_devices: number
    total_enabled: number
  }
  alerts?: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export default function MonitoringPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<SystemStats>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMonitoringData()
  }, [])

  const loadMonitoringData = async () => {
    try {
      setLoading(true)
      
      // Load system stats
      const statsResponse = await api.getSystemStats() as any
      setStats(statsResponse.statistics || {})
      
      // Load alerts
      const alertsResponse = await api.getAlerts(50) as any
      const alertsList = Array.isArray(alertsResponse) ? alertsResponse : (alertsResponse.alerts || [])
      setAlerts(alertsList)
      
      // Load audit logs
      const auditResponse = await api.getAuditLogs(undefined, undefined, undefined, 100, 0) as any
      const logsList = Array.isArray(auditResponse) ? auditResponse : (auditResponse.logs || [])
      setAuditLogs(logsList)
    } catch (error: any) {
      toast.error(error.message || "Failed to load monitoring data")
      setStats({})
      setAlerts([])
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <IconX className="h-4 w-4 text-red-500" />
      case "high":
        return <IconAlertCircle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <IconInfoCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const alertColumns = [
    {
      accessorKey: "severity",
      header: "Severity",
      cell: (row: any) => {
        const severity = row.severity || "low"
        return (
          <div className="flex items-center gap-2">
            {getSeverityIcon(severity)}
            <Badge variant="outline" className="capitalize">
              {severity}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "message",
      header: "Message",
    },
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: (row: any) => {
        const date = new Date(row.timestamp)
        return date.toLocaleString()
      },
    },
  ]

  const auditColumns = [
    {
      accessorKey: "action",
      header: "Action",
    },
    {
      accessorKey: "ldap_uid",
      header: "User",
    },
    {
      accessorKey: "performed_by",
      header: "Performed By",
    },
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: (row: any) => {
        const date = new Date(row.timestamp)
        return date.toLocaleString()
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
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardDescription>Total Devices</CardDescription>
                    <CardTitle className="text-2xl">{stats.devices?.total || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Active Devices</CardDescription>
                    <CardTitle className="text-2xl">{stats.devices?.active || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Critical Alerts</CardDescription>
                    <CardTitle className="text-2xl">{stats.alerts?.critical || 0}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="px-4 lg:px-6">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>System alerts and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleTable 
                      data={alerts} 
                      columns={alertColumns}
                      loading={loading}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                    <CardDescription>System activity and changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleTable 
                      data={auditLogs} 
                      columns={auditColumns}
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
