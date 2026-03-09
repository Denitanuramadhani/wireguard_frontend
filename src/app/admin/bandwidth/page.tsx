"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Zap, Activity } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { BandwidthDashboard } from "@/components/admin/bandwidth-dashboard"
import { SpeedTestModal } from "@/components/admin/speed-test-modal"

export default function AdminBandwidthPage() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [bandwidthLimits, setBandwidthLimits] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [limitMB, setLimitMB] = useState("")
  const [speedTestOpen, setSpeedTestOpen] = useState(false)

  // Real-time Traffic Data
  const [trafficStats, setTrafficStats] = useState<any>(null)
  const [trafficHistory, setTrafficHistory] = useState<any[]>([])

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
      loadBandwidthLimits()
      loadAllUsers()
      loadTrafficData()

      // Poll for traffic data every 10 seconds
      const interval = setInterval(loadTrafficData, 10000)
      return () => clearInterval(interval)
    }
  }, [user, isAdmin])

  const loadTrafficData = async () => {
    try {
      // Use system stats which is known to work on this server
      const [statsResponse, analyticsResponse] = await Promise.allSettled([
        api.getSystemStats(),
        api.getTrafficAnalytics(undefined, 24)
      ])

      let statsData: any = {}
      if (statsResponse.status === 'fulfilled') {
        statsData = (statsResponse.value as any).statistics || {}
      }

      let history: any[] = []
      if (analyticsResponse.status === 'fulfilled') {
        const data = analyticsResponse.value as any
        const rawHistory = Array.isArray(data) ? data : (data.data || [])
        history = rawHistory.map((item: any) => ({
          time: new Date(item.timestamp || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          upload: Math.floor((item.transfer_tx || item.tx_bytes || 0) / 1024), // to KB
          download: Math.floor((item.transfer_rx || item.rx_bytes || 0) / 1024), // to KB
        }))
      }

      // Map statistics from actual server response
      // Dashboard uses statsData for real values
      const totalTraffic = statsData.bandwidth?.total || statsData.traffic_total || 0
      const currentTx = statsData.bandwidth?.current_tx || 0
      const currentRx = statsData.bandwidth?.current_rx || 0

      setTrafficStats({
        peak_speed: statsData.bandwidth?.peak || "N/A",
        total_usage: totalTraffic ? `${(totalTraffic / (1024 ** 3)).toFixed(2)} GB` : "0.00 GB",
        current_load: totalTraffic ? `${((currentTx + currentRx) / (1024 * 1024)).toFixed(1)} Mbps` : "0.0 Mbps",
        recorded_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      setTrafficHistory(history)
    } catch (error) {
      console.error("Failed to load traffic data:", error)
    }
  }

  const loadAllUsers = async () => {
    try {
      const response = await api.getAdminUsers()
      setAllUsers(response.users || [])
    } catch (error: any) {
      console.error("Failed to load users:", error)
    }
  }

  const loadBandwidthLimits = async () => {
    try {
      setLoading(true)
      const response = await api.getBandwidthLimits() as any
      const limits = Array.isArray(response) ? response : (response.limits || [])
      setBandwidthLimits(limits)
    } catch (error: any) {
      toast.error(error.message || "Failed to load bandwidth limits")
      setBandwidthLimits([])
    } finally {
      setLoading(false)
    }
  }

  const handleSetLimit = async () => {
    if (!username || !limitMB) {
      toast.error("Username and limit are required")
      return
    }

    try {
      await api.setBandwidthLimit(username, parseFloat(limitMB))
      toast.success("Bandwidth limit set successfully")
      setUsername("")
      setLimitMB("")
      loadBandwidthLimits()
    } catch (error: any) {
      toast.error(error.message || "Failed to set bandwidth limit")
    }
  }

  const handleResetUsage = async (username: string) => {
    try {
      await api.resetUserBandwidth(username)
      toast.success(`Bandwidth usage reset for ${username}`)
      loadBandwidthLimits()
    } catch (error: any) {
      toast.error(error.message || "Failed to reset bandwidth usage")
    }
  }

  const columns: any[] = [
    {
      accessorKey: "ldap_uid",
      header: "Username",
    },
    {
      accessorKey: "limit_mb",
      header: "Limit (MB)",
      cell: (row: any) => row.limit_mb ? `${row.limit_mb.toLocaleString()} MB` : "Unlimited",
    },
    {
      accessorKey: "used_mb",
      header: "Used (MB)",
      cell: (row: any) => `${row.used_mb.toLocaleString()} MB`,
    },
    {
      header: "Actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={async () => {
              try {
                await api.setBandwidthLimit(row.ldap_uid, 0)
                toast.success(`Bandwidth limit reset to Unlimited for ${row.ldap_uid}`)
                loadBandwidthLimits()
              } catch (error: any) {
                toast.error(error.message || "Failed to reset limit")
              }
            }}
          >
            Reset Limit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleResetUsage(row.ldap_uid)}
          >
            Reset Usage
          </Button>
        </div>
      )
    }
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
        <div className="flex flex-1 flex-col pb-10">
          <div className="pt-8">
            {/* Header */}
            <div className="px-4 lg:px-6 relative mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90">
                    Bandwidth Analytics
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Deep visibility into network traffic flow and user consumption.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 h-11 px-6 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] group"
                    onClick={() => setSpeedTestOpen(true)}
                  >
                    <Activity className="h-5 w-5 group-hover:animate-spin" />
                    Run Network Diagnostics
                  </Button>
                </div>
              </div>
              <div className="absolute -bottom-4 left-4 lg:left-6 w-32 h-1.5 bg-primary/20 rounded-full" />
            </div>

            <SpeedTestModal open={speedTestOpen} onOpenChange={setSpeedTestOpen} />

            <div className="px-4 lg:px-6 space-y-8 mt-10">
              {/* Hero Dashboard */}
              <BandwidthDashboard stats={trafficStats} history={trafficHistory} />

              {/* Management Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Set Limit Form */}
                <Card className="lg:col-span-1 border-muted-foreground/10 bg-background/50 backdrop-blur-sm self-start">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Control Center
                    </CardTitle>
                    <CardDescription>Allocate bandwidth limits to network users.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest pl-1">Target User</label>
                      <Select value={username} onValueChange={setUsername}>
                        <SelectTrigger className="h-11 bg-muted/30 border-muted-foreground/10">
                          <SelectValue placeholder="Select user..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allUsers.map((u) => (
                            <SelectItem key={u.username} value={u.username}>
                              {u.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest pl-1">Cap Limit (MB)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 5000"
                        className="h-11 bg-muted/30 border-muted-foreground/10"
                        value={limitMB}
                        onChange={(e) => setLimitMB(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSetLimit} className="w-full h-11 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                      Apply Restriction
                    </Button>
                    {username && (
                      <Button variant="ghost" onClick={() => { setUsername(""); setLimitMB(""); }} className="w-full text-xs">
                        Clear Selection
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Usage Table */}
                <Card className="lg:col-span-2 border-muted-foreground/10 shadow-lg overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b border-muted-foreground/5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Consumer Rankings</CardTitle>
                        <CardDescription>Who is using the most bandwidth right now?</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={loadBandwidthLimits} className="bg-background">
                        Sync Data
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <SimpleTable
                      data={bandwidthLimits}
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
