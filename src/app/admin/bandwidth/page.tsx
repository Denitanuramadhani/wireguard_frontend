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
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function AdminBandwidthPage() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [bandwidthLimits, setBandwidthLimits] = useState<any[]>([])
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
    }
  }, [user, isAdmin])

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

  const columns = [
    {
      accessorKey: "ldap_uid",
      header: "Username",
    },
    {
      accessorKey: "limit_mb",
      header: "Limit (MB)",
      cell: (row: any) => `${row.limit_mb || 0} MB`,
    },
    {
      accessorKey: "used_mb",
      header: "Used (MB)",
      cell: (row: any) => `${row.used_mb || 0} MB`,
    },
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
                    <CardDescription>Set bandwidth limit for a user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Limit (MB)"
                        value={limitMB}
                        onChange={(e) => setLimitMB(e.target.value)}
                      />
                      <Button onClick={handleSetLimit}>Set Limit</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bandwidth Limits</CardTitle>
                    <CardDescription>Current bandwidth limits for all users</CardDescription>
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
