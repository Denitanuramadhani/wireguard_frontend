"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
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
import { api } from "@/lib/api"
import { toast } from "sonner"
import { IconShield, IconDeviceMobile, IconCheck, IconX } from "@tabler/icons-react"

export default function MyAccessPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [accessData, setAccessData] = useState<any>(null)
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
      loadAccessData()
    }
  }, [user])

  const loadAccessData = async () => {
    try {
      setLoading(true)
      const response = await api.getMyAccess() as any
      setAccessData(response)
    } catch (error: any) {
      toast.error(error.message || "Failed to load access information")
      setAccessData(null)
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardDescription className="flex items-center gap-2">
                        <IconShield className="h-4 w-4" />
                        VPN Access Status
                      </CardDescription>
                      <CardTitle className="text-2xl">
                        {loading ? (
                          "Loading..."
                        ) : accessData?.wireguard_enabled ? (
                          <div className="flex items-center gap-2">
                            <IconCheck className="h-5 w-5 text-green-500" />
                            <span>Enabled</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <IconX className="h-5 w-5 text-red-500" />
                            <span>Disabled</span>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {accessData?.wireguard_enabled
                          ? "Your VPN access is currently active. You can connect to the VPN network."
                          : "Your VPN access is currently disabled. Please contact administrator to enable access."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardDescription className="flex items-center gap-2">
                        <IconDeviceMobile className="h-4 w-4" />
                        Device Limit
                      </CardDescription>
                      <CardTitle className="text-2xl">
                        {loading ? (
                          "Loading..."
                        ) : (
                          `${accessData?.device_count || 0} / ${accessData?.max_devices || 0}`
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {accessData?.device_count >= accessData?.max_devices
                          ? "You have reached your device limit. Revoke a device to add a new one."
                          : `You can add ${(accessData?.max_devices || 0) - (accessData?.device_count || 0)} more device(s).`}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardDescription>Username</CardDescription>
                      <CardTitle className="text-2xl">
                        {loading ? "Loading..." : accessData?.username || user?.username || "-"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Your account username for VPN access
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {accessData?.devices && accessData.devices.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Your Devices</CardTitle>
                      <CardDescription>List of your registered VPN devices</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {accessData.devices.map((device: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{device.device_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {device.vpn_ip} • {device.status}
                              </p>
                            </div>
                            <Badge variant={device.status === "active" ? "default" : "secondary"}>
                              {device.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
