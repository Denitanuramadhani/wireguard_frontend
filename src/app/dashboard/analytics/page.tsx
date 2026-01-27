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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [trafficData, setTrafficData] = useState<Array<{ date: string; traffic: number }>>([])
  const [summary, setSummary] = useState<any>(null)
  const [devices, setDevices] = useState<any[]>([])
  const [selectedDevice, setSelectedDevice] = useState<number | undefined>(undefined)
  const [hours, setHours] = useState(24)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadDevices()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, selectedDevice, hours])

  const loadDevices = async () => {
    try {
      const response = await api.getMyDevices() as any
      const devicesList = Array.isArray(response) ? response : (response.devices || [])
      setDevices(devicesList.filter((d: any) => d.status === 'active'))
    } catch (error: any) {
      console.error('Failed to load devices:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Load traffic analytics
      const trafficResponse = await api.getTrafficAnalytics(selectedDevice, hours) as any
      const analytics = Array.isArray(trafficResponse) ? trafficResponse : (trafficResponse.data || [])
      
      // Transform traffic data for chart
      const chartData = analytics.map((item: any) => ({
        date: item.timestamp || item.date,
        traffic: item.transfer_total || item.traffic || item.bytes || 0,
      }))
      setTrafficData(chartData)
      
      // Load summary
      if (trafficResponse.summary) {
        setSummary(trafficResponse.summary)
      } else {
        const summaryResponse = await api.getTrafficSummary(selectedDevice) as any
        setSummary(summaryResponse)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load analytics")
      setTrafficData([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

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
                    <CardTitle>Traffic Analytics</CardTitle>
                    <CardDescription>Monitor your VPN traffic usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-4">
                      <Select
                        value={selectedDevice?.toString() || "all"}
                        onValueChange={(value) => setSelectedDevice(value === "all" ? undefined : parseInt(value))}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Devices</SelectItem>
                          {devices.map((device) => (
                            <SelectItem key={device.id || device.device_id} value={(device.id || device.device_id || 0).toString()}>
                              {device.device_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={hours.toString()} onValueChange={(value) => setHours(parseInt(value))}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Last Hour</SelectItem>
                          <SelectItem value="24">Last 24 Hours</SelectItem>
                          <SelectItem value="168">Last 7 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <ChartAreaInteractive data={trafficData} loading={loading} />
                  </CardContent>
                </Card>

                {summary && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardDescription>Total Traffic</CardDescription>
                        <CardTitle className="text-2xl">
                          {summary.total_traffic
                            ? `${(summary.total_traffic / (1024 * 1024 * 1024)).toFixed(2)} GB`
                            : "0 GB"}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardDescription>Download</CardDescription>
                        <CardTitle className="text-2xl">
                          {summary.total_rx
                            ? `${(summary.total_rx / (1024 * 1024 * 1024)).toFixed(2)} GB`
                            : "0 GB"}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardDescription>Upload</CardDescription>
                        <CardTitle className="text-2xl">
                          {summary.total_tx
                            ? `${(summary.total_tx / (1024 * 1024 * 1024)).toFixed(2)} GB`
                            : "0 GB"}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
