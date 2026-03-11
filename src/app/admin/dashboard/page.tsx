"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { WelcomeHeader } from "@/components/admin/welcome-header"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { DashboardCharts } from "@/components/admin/dashboard-charts"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { api } from "@/lib/api"
import { formatBytes } from "@/lib/utils"

export default function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPeers: 0,
    activePeers: 0,
    totalTraffic: "0 B",
    systemStatus: "Checking...",
    totalDevices: 0,
    alertCount: 0,
  })
  const [trafficData, setTrafficData] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/dashboard')
      } else {
        fetchAllData()

        // Polling every 60 seconds
        const interval = setInterval(fetchAllData, 60000)
        return () => clearInterval(interval)
      }
    }
  }, [user, loading, isAdmin, router])

  const fetchAllData = async () => {
    try {
      setDataLoading(true)
      const [statsResponse, trafficResponse] = await Promise.all([
        api.getSystemStats(),
        api.getTrafficAnalytics(undefined, 24)
      ])

      if (statsResponse && statsResponse.status === 'ok' && statsResponse.statistics) {
        const s = statsResponse.statistics
        setStats({
          totalUsers: s.users.total,
          totalPeers: s.devices.total,
          activePeers: s.devices.has_recent_handshake,
          totalTraffic: formatBytes(s.traffic.total_bytes),
          systemStatus: s.health.status === 'ok' ? 'Healthy' : 'Issues Detected',
          totalDevices: s.devices.total,
          alertCount: s.alerts.total_recent,
        })
      }

      if (trafficResponse) {
        const analytics = Array.isArray(trafficResponse) ? trafficResponse : ((trafficResponse as any).data || [])
        const chartData = analytics.map((item: any) => ({
          month: new Date(item.timestamp || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          traffic: (item.transfer_total || item.traffic || item.bytes || 0) / (1024 * 1024), // MB
        }))
        setTrafficData(chartData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
        <div className="flex flex-1 flex-col pb-10">
          <div className="flex flex-col gap-6 pt-6">

            {/* Header and Welcome */}
            <div className="flex flex-col gap-2">
              <WelcomeHeader username={user.username} alertCount={stats.alertCount} />

              {/* Breadcrumbs Navigation */}
              <div className="flex items-center gap-2 px-4 text-sm text-muted-foreground lg:px-6">
                <Link href="/admin/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold text-primary">Overview</span>
              </div>
            </div>

            {/* Metric Cards Section (3x2 Grid) */}
            <DashboardStats stats={stats} loading={dataLoading} />

            {/* Analytics Section (Two Columns) */}
            <DashboardCharts stats={stats} trafficData={trafficData} />

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

