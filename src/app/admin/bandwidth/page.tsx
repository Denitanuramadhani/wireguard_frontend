"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SimpleTable } from "@/components/simple-table"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function AdminBandwidthPage() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [bandwidthLimits, setBandwidthLimits] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [limitMB, setLimitMB] = useState("")

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
    }
  }, [user, isAdmin])

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
            onClick={() => {
              setUsername(row.ldap_uid)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            Edit Limit
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

  // Mock chart data for bandwidth usage
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    date: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
    traffic: Math.random() * 5000000000,
  }))

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Global Bandwidth Usage</CardTitle>
                    <CardDescription>System-wide bandwidth consumption</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartAreaInteractive data={chartData} loading={loading} />
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Set Bandwidth Limit</CardTitle>
                    <CardDescription>Update bandwidth limit for a specific user (MB)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1">
                        <Select value={username} onValueChange={setUsername}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allUsers.map((u) => (
                              <SelectItem key={u.username} value={u.username}>
                                {u.username} {u.cn ? `(${u.cn})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full md:w-48">
                        <Input
                          type="number"
                          placeholder="Limit in MB"
                          value={limitMB}
                          onChange={(e) => setLimitMB(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleSetLimit} className="w-full md:w-auto">
                        Apply Limit
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setUsername("");
                          setLimitMB("");
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Bandwidth Usage Summary</CardTitle>
                        <CardDescription>Real-time bandwidth consumption across all user devices</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={loadBandwidthLimits} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh Data"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
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
