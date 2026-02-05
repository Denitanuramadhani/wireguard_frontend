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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { IconDownload, IconQrcode, IconFileText } from "@tabler/icons-react"

interface Device {
  id: number
  device_id?: number
  device_name: string
  vpn_ip: string
  status: string
}

export default function DownloadsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
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
      loadDevices()
    }
  }, [user])

  const loadDevices = async () => {
    try {
      setLoading(true)
      const response = await api.getMyDevices() as any
      const devicesList = Array.isArray(response) ? response : (response.devices || [])
      setDevices(devicesList.filter((d: any) => d.status === 'active'))
    } catch (error: any) {
      toast.error(error.message || "Failed to load devices")
      setDevices([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadConfig = async (deviceId: number) => {
    try {
      const device = devices.find(d => (d.id || d.device_id) === deviceId)
      if (!device) {
        toast.error("Device not found")
        return
      }

      const response = await api.getDeviceConfig(deviceId) as any
      if (response.config) {
        const element = document.createElement("a")
        const file = new Blob([response.config], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = `wg-${device.device_name.replace(/\s+/g, '-').toLowerCase()}.conf`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        toast.success("Configuration downloaded successfully")
      } else if (response.note || response.message) {
        toast.error(response.note || response.message || "Config not available")
      } else {
        toast.error("Configuration file is not available for this device.")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to download config")
    }
  }

  const handleDownloadQR = async (deviceId: number) => {
    try {
      const response = await api.getDeviceQR(deviceId) as any
      if (response.qr_code) {
        const qrUrl = `data:image/png;base64,${response.qr_code}`
        const a = document.createElement('a')
        a.href = qrUrl
        a.download = `device-${deviceId}-qr.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success("QR code downloaded")
      } else {
        toast.error("QR code not available")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to download QR code")
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
                <Card>
                  <CardHeader>
                    <CardTitle>Download WireGuard Configuration</CardTitle>
                    <CardDescription>
                      Download configuration files or QR codes for your devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading devices...
                      </div>
                    ) : devices.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No active devices found. Add a device first to download configuration.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {devices.map((device) => {
                          const deviceId = device.id || device.device_id || 0
                          return (
                            <Card key={deviceId}>
                              <CardHeader>
                                <CardTitle className="text-lg">{device.device_name}</CardTitle>
                                <CardDescription>
                                  {device.vpn_ip}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Badge variant={device.status === "active" ? "default" : "secondary"}>
                                  {device.status}
                                </Badge>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadConfig(deviceId)}
                                    className="flex-1"
                                  >
                                    <IconFileText className="h-4 w-4 mr-2" />
                                    Config
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadQR(deviceId)}
                                    className="flex-1"
                                  >
                                    <IconQrcode className="h-4 w-4 mr-2" />
                                    QR Code
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
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
