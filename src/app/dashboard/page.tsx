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
import { motion, AnimatePresence } from "framer-motion"

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
        <div className="text-center group">
          <div className="relative h-12 w-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="mt-6 text-sm font-bold tracking-widest text-muted-foreground uppercase animate-pulse">Initializing Dashboard...</p>
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-1 flex-col"
        >
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-8 md:gap-8 md:py-10">
              <div className="px-4 lg:px-6 mb-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 md:text-4xl">
                  Overview
                </h1>
                <p className="text-muted-foreground mt-2 text-md">
                  Welcome back, <span className="text-primary font-bold">{user.username}</span>. Here's your network activity.
                </p>
              </div>

              <SectionCards stats={stats} loading={dataLoading} isAdmin={false} />

              <div className="px-4 lg:px-6">
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Traffic Activity</h3>
                      <p className="text-sm text-muted-foreground">Network usage over the last 24 hours</p>
                    </div>
                  </div>
                  <ChartAreaInteractive data={trafficData} loading={dataLoading} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </SidebarInset>
    </SidebarProvider>
  )
}
