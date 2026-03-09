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

export default function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  // Example stats / in a real app, this would be fetched from API
  const [stats] = useState({
    totalUsers: 142,
    totalPeers: 85,
    activePeers: 62,
    totalTraffic: "1.4 TB",
    systemStatus: "Healthy",
    totalDevices: 156,
  })

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/dashboard')
      }
    }
  }, [user, loading, isAdmin, router])

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
              <WelcomeHeader />

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
            <DashboardStats stats={stats} />

            {/* Analytics Section (Two Columns) */}
            <DashboardCharts stats={stats} />

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

