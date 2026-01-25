"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalUsers: 0,
    totalTraffic: 0,
  })
  const [trafficData, setTrafficData] = useState<Array<{ date: string; traffic: number }>>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (isAdmin) {
        router.push('/admin/dashboard')
      }
    }
  }, [user, loading, isAdmin, router])

  useEffect(() => {
    if (user && !isAdmin) {
      loadDashboardData()
    }
  }, [user, isAdmin])

  const loadDashboardData = async () => {
    try {
      setDataLoading(true)
      
      // Load devices to get stats
      const devicesResponse = await api.getMyDevices() as any
      const devices = Array.isArray(devicesResponse) ? devicesResponse : (devicesResponse.devices || [])
      
      const activeDevices = devices.filter((d: any) => d.status === 'active').length
      const totalTraffic = devices.reduce((sum: number, d: any) => {
        return sum + (d.transfer_total || 0)
      }, 0)

      // Load traffic analytics
      const trafficResponse = await api.getTrafficAnalytics(undefined, 24) as any
      const analytics = Array.isArray(trafficResponse) ? trafficResponse : (trafficResponse.data || [])
      
      setStats({
        totalDevices: devices.length,
        activeDevices,
        totalUsers: 0, // Not available for regular users
        totalTraffic,
      })

      // Transform traffic data for chart
      const chartData = analytics.map((item: any) => ({
        date: item.timestamp || item.date,
        traffic: item.transfer_total || item.traffic || item.bytes || 0,
      }))
      setTrafficData(chartData)
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error)
      // Set empty data on error
      setStats({
        totalDevices: 0,
        activeDevices: 0,
        totalUsers: 0,
        totalTraffic: 0,
      })
      setTrafficData([])
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !user || isAdmin) {
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
              <SectionCards stats={stats} loading={dataLoading} isAdmin={false} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={trafficData} loading={dataLoading} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
