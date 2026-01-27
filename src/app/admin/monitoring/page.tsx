"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
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

export default function AdminMonitoringPage() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [alerts, setAlerts] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

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
      loadMonitoringData()
    }
  }, [user, isAdmin])

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
    } catch (error: any) {
      toast.error(error.message || "Failed to load monitoring data")
      setStats({})
      setAlerts([])
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

  // Mock chart data for system performance
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    date: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
    traffic: Math.random() * 1000000000,
  }))

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
                    <CardTitle>System Performance</CardTitle>
                    <CardDescription>Server connection and performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartAreaInteractive data={chartData} loading={loading} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>System alerts and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {alerts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No alerts
                        </div>
                      ) : (
                        alerts.map((alert, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1">
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {alert.severity}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
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
