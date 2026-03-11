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
import { Activity, Download, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { SystemMonitoring } from "@/components/admin/system-monitoring"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminMonitoringPage() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [alerts, setAlerts] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

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

      // Set up polling interval (60 seconds)
      const interval = setInterval(loadMonitoringData, 60000)
      return () => clearInterval(interval)
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

      // Load audit logs for console
      const logsResponse = await api.getAuditLogs("", "", "", 10, 0) as any
      setAuditLogs(logsResponse.logs || [])

      // Filter top 3 priority alerts (critical > high > medium > info)
      const sortedAlerts = alertsList.sort((a: any, b: any) => {
        const priority: any = { critical: 0, high: 1, medium: 2, info: 3 }
        const aP = priority[a.severity] ?? 99
        const bP = priority[b.severity] ?? 99
        return aP - bP
      }).slice(0, 3)

      setAlerts(sortedAlerts)
    } catch (error: any) {
      toast.error(error.message || "Failed to load monitoring data")
      setStats({})
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const handleResolveAlert = async (id: number) => {
    try {
      await api.resolveAlert(id)
      toast.success("Security Event Resolved", {
        description: "The incident has been logged and cleared from the active queue.",
        icon: <div className="bg-emerald-500 rounded-full p-1"><Check className="h-3 w-3 text-white" /></div>,
        className: "border-emerald-500/50 bg-background shadow-lg shadow-emerald-500/10",
      })
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve alert")
    }
  }

  const handleExportReport = async () => {
    try {
      setExporting(true)
      const blob = await api.exportMonitoringReport()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wireguard-monitoring-report-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Report exported successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to export report")
    } finally {
      setExporting(false)
    }
  }

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
        <div className="flex flex-1 flex-col pb-10">
          <div className="pt-8">
            {/* Header */}
            <div className="px-4 lg:px-6 relative mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90">
                  System Monitoring
                </h1>
                <p className="text-muted-foreground text-lg">
                  Real-time diagnostics and infrastructure health overview.
                </p>
              </div>
              <Button
                onClick={handleExportReport}
                disabled={exporting}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 gap-2 h-11 px-6 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                Export Monthly Report
              </Button>
              <div className="absolute -bottom-4 left-4 lg:left-6 w-32 h-1.5 bg-primary/20 rounded-full" />
            </div>

            <div className="px-4 lg:px-6 space-y-8 mt-10">
              {/* Top Row: System Health & Uptime */}
              <SystemMonitoring stats={stats} auditLogs={auditLogs} />

              <div className="space-y-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Devices Card */}
                  <Card className="bg-muted/30 border-muted-foreground/10 hover:border-primary/50 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/5 shadow-lg group">
                    <CardHeader className="py-6">
                      <CardDescription className="font-bold uppercase text-xs tracking-[0.2em] text-muted-foreground/70 group-hover:text-primary transition-colors duration-300">Total Registered Devices</CardDescription>
                      <CardTitle className="text-4xl font-black mt-2 group-hover:text-primary transition-colors duration-300">{stats.devices?.total || 0}</CardTitle>
                    </CardHeader>
                  </Card>

                  {/* Active Sessions Card */}
                  <Card className="bg-muted/30 border-muted-foreground/10 hover:border-emerald-500/50 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-500/5 shadow-lg group">
                    <CardHeader className="py-6">
                      <div className="flex items-center justify-between">
                        <CardDescription className="font-bold uppercase text-xs tracking-[0.2em] text-muted-foreground/70 group-hover:text-emerald-500 transition-colors duration-300">Live Tunnel Sessions</CardDescription>
                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse-glow shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                      </div>
                      <CardTitle className="text-4xl font-black text-emerald-600 mt-2 group-hover:text-emerald-500 transition-colors duration-300">{stats.devices?.active || 0}</CardTitle>
                    </CardHeader>
                  </Card>

                  {/* Alert System Status Card */}
                  <Card className="bg-muted/30 border-muted-foreground/10 hover:border-red-500/50 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-red-500/5 shadow-lg group">
                    <CardHeader className="py-6">
                      <div className="flex items-center justify-between">
                        <CardDescription className="font-bold uppercase text-xs tracking-[0.2em] text-muted-foreground/70 group-hover:text-red-500 transition-colors duration-300">Alert System</CardDescription>
                        <div className={`h-3 w-3 rounded-full ${alerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'} shadow-[0_0_12px_rgba(239,68,68,0.4)]`} />
                      </div>
                      <CardTitle className={`text-4xl font-black mt-2 transition-colors duration-300 ${alerts.length > 0 ? 'text-red-500 group-hover:text-red-400' : 'text-emerald-600 group-hover:text-emerald-500'}`}>
                        {alerts.length > 0 ? `${alerts.length} Active` : 'Healthy'}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Detailed Alerts Section */}
                {alerts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-foreground/70">Priority Security Events</h2>
                      <Badge variant="outline" className="text-[10px] font-bold border-red-500/20 text-red-500 bg-red-500/5 items-center gap-1.5 flex">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                        Attention Required
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {alerts.map((alert) => (
                          <motion.div
                            key={alert.id || alert.timestamp}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.4 } }}
                            layout
                          >
                            <Card className="bg-background/40 backdrop-blur-sm border-muted-foreground/10 hover:border-emerald-500/30 transition-all overflow-hidden relative group">
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                              <CardContent className="p-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div className={`h-2.5 w-2.5 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'} animate-pulse`} />
                                    <div className={`absolute inset-0 h-2.5 w-2.5 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'} animate-ping opacity-75`} />
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-foreground capitalize">{alert.type || 'System Event'}</span>
                                      <span className="text-[10px] font-medium text-muted-foreground/60">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed italic">{alert.message}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right flex flex-col items-end">
                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${alert.severity === 'critical' ? 'text-red-500' : 'text-orange-500'
                                      }`}>{alert.severity}</span>
                                    <span className="text-[9px] text-muted-foreground/40 font-mono italic">#{alert.id || 'EVT-721'}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 group-hover:bg-emerald-500/10 transition-all hover:text-emerald-500 bg-background/50"
                                    onClick={() => handleResolveAlert(alert.id)}
                                  >
                                    <Check className="h-5 w-5" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Full Width Throughput Chart */}
                <Card className="border-muted-foreground/10 shadow-2xl bg-background/50 backdrop-blur-sm overflow-hidden mt-6">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      Real-time Network Throughput
                    </CardTitle>
                    <CardDescription>Deep visibility into historical tunnel traffic and bandwidth allocation.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ChartAreaInteractive data={chartData} loading={loading} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider >
  )
}
