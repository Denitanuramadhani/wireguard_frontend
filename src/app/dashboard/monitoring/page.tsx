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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { IconChevronLeft, IconChevronRight, IconRefresh, IconActivity } from "@tabler/icons-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { motion, AnimatePresence } from "framer-motion"

interface AuditLog {
  action: string
  ldap_uid?: string
  performed_by: string
  created_at: string
  timestamp?: string
}

interface TrafficData {
  timestamp: string
  transfer_rx: number
  transfer_tx: number
  transfer_total: number
}

function MonitoringContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get filter params from URL
  const actionFilterParam = searchParams.get('action') || ''
  const actionFilter = actionFilterParam === 'all' ? '' : actionFilterParam
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 50
  const offset = (page - 1) * limit

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [trafficData, setTrafficData] = useState<TrafficData[]>([])
  const [loading, setLoading] = useState(true)
  const [trafficLoading, setTrafficLoading] = useState(true)
  const [totalLogs, setTotalLogs] = useState(0)
  const [actionFilterValue, setActionFilterValue] = useState(actionFilterParam || 'all')

  const chartConfig = {
    transfer_rx: {
      label: "Download",
      color: "hsl(var(--chart-1))",
    },
    transfer_tx: {
      label: "Upload",
      color: "hsl(var(--chart-2))",
    },
  }

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
      loadTrafficData()
    }
  }, [user, actionFilter, page])

  const loadTrafficData = async () => {
    try {
      setTrafficLoading(true)
      const response = await api.getTrafficAnalytics(undefined, 24) as any
      if (response && response.data) {
        setTrafficData(response.data)
      }
    } catch (error: any) {
      console.error("Failed to load traffic data:", error)
    } finally {
      setTrafficLoading(false)
    }
  }

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

    } catch (error: any) {
      toast.error(error.message || "Failed to load monitoring data")
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleActionFilterChange = (value: string) => {
    setActionFilterValue(value)
    const params = new URLSearchParams()
    if (value && value !== "all") params.set('action', value)
    router.push(`/dashboard/monitoring?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (actionFilterParam && actionFilterParam !== "all") params.set('action', actionFilterParam)
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center group">
          <div className="relative h-12 w-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="mt-6 text-sm font-bold tracking-widest text-muted-foreground uppercase animate-pulse">Accessing Logs...</p>
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-1 flex-col"
        >
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-8 md:gap-8 md:py-10">
              <div className="px-4 lg:px-6 mb-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 md:text-4xl">
                  Monitoring
                </h1>
                <p className="text-muted-foreground mt-2 text-md">
                  Review your network traffic and security audit logs.
                </p>
              </div>

              <div className="px-4 lg:px-6">

                {/* Traffic Chart */}
                <Card className="mb-8 border border-slate-200/60 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <div>
                      <CardTitle className="text-xl font-bold">Traffic Usage</CardTitle>
                      <CardDescription>Real-time traffic monitor (last 24 hours)</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={loadTrafficData}
                      disabled={trafficLoading}
                      className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                    >
                      <IconRefresh className={`h-4 w-4 ${trafficLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[400px] w-full overflow-visible pb-14 px-2">
                      {trafficLoading ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4">
                          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm font-medium text-muted-foreground">Gathering network metrics...</p>
                        </div>
                      ) : trafficData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="overflow-visible">
                          <AreaChart
                            data={trafficData}
                            margin={{ top: 20, right: 35, left: 10, bottom: 45 }}
                          >
                            <defs>
                              <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-transfer_rx)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-transfer_rx)" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-transfer_tx)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-transfer_tx)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="timestamp"
                              tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <YAxis
                              tickFormatter={(value) => formatBytes(value)}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Area
                              type="monotone"
                              dataKey="transfer_rx"
                              stroke="var(--color-transfer_rx)"
                              fillOpacity={1}
                              fill="url(#colorRx)"
                              name="Download"
                            />
                            <Area
                              type="monotone"
                              dataKey="transfer_tx"
                              stroke="var(--color-transfer_tx)"
                              fillOpacity={1}
                              fill="url(#colorTx)"
                              name="Upload"
                            />
                          </AreaChart>
                        </ChartContainer>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/50">
                          <IconActivity className="h-12 w-12 text-slate-300 dark:text-zinc-700" />
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-600 dark:text-zinc-400">No traffic data recorded yet.</p>
                            <p className="text-xs text-muted-foreground mt-1">Data is collected every minute during active usage.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-12 border border-slate-200/60 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
                    <div>
                      <CardTitle className="text-xl font-bold">Audit Logs</CardTitle>
                      <CardDescription>Your personal activity and changes</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select value={actionFilterValue} onValueChange={handleActionFilterChange}>
                        <SelectTrigger className="w-[180px] h-10 border-slate-200/60 bg-slate-50/50 dark:bg-zinc-900/50 dark:border-zinc-800 rounded-xl font-medium">
                          <SelectValue placeholder="Filter by action" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200/60 dark:border-zinc-800 overflow-hidden">
                          <SelectItem value="all" className="focus:bg-primary/5 focus:text-primary transition-colors">All Actions</SelectItem>
                          <SelectItem value="device_added" className="focus:bg-primary/5 focus:text-primary transition-colors">Device Added</SelectItem>
                          <SelectItem value="device_revoked" className="focus:bg-primary/5 focus:text-primary transition-colors">Device Revoked</SelectItem>
                          <SelectItem value="login_success" className="focus:bg-primary/5 focus:text-primary transition-colors">Login Success</SelectItem>
                          <SelectItem value="login_failed" className="focus:bg-primary/5 focus:text-primary transition-colors">Login Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SimpleTable
                      data={auditLogs}
                      columns={auditColumns}
                      loading={loading}
                    />
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100 dark:border-zinc-900">
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                          Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span> ({totalLogs} total)
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                            className="h-9 rounded-xl border-slate-200/60 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all active:scale-95"
                          >
                            <IconChevronLeft className="h-4 w-4 mr-1" />
                            Prev
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="h-9 rounded-xl border-slate-200/60 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all active:scale-95"
                          >
                            Next
                            <IconChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function MonitoringPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center group">
          <div className="relative h-12 w-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="mt-6 text-sm font-bold tracking-widest text-muted-foreground uppercase animate-pulse">Initializing Monitor...</p>
        </div>
      </div>
    }>
      <MonitoringContent />
    </Suspense>
  )
}
