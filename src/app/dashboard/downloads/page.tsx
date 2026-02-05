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
import { IconDownload, IconQrcode, IconFileText, IconCopy, IconCheck } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [selectedConfig, setSelectedConfig] = useState<{ name: string, content: string } | null>(null)
  const [selectedQR, setSelectedQR] = useState<{ name: string, content: string } | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const handleViewConfig = async (deviceId: number) => {
    try {
      const device = devices.find(d => (d.id || d.device_id) === deviceId)
      if (!device) {
        toast.error("Device not found")
        return
      }

      const response = await api.getDeviceConfig(deviceId) as any
      if (response.config) {
        setSelectedConfig({
          name: device.device_name,
          content: response.config
        })
        setSelectedQR(null)
        setIsPreviewOpen(true)
      } else if (response.note || response.message) {
        toast.error(response.note || response.message || "Config not available")
      } else {
        toast.error("Configuration file is not available for this device.")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load config")
    }
  }

  const handleDownloadConfig = (name: string, content: string) => {
    const element = document.createElement("a")
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `wg-${name.replace(/\s+/g, '-').toLowerCase()}.conf`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Configuration downloaded successfully")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Config copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewQR = async (deviceId: number) => {
    try {
      const device = devices.find(d => (d.id || d.device_id) === deviceId)
      if (!device) return

      const response = await api.getDeviceQR(deviceId) as any
      if (response.qr_code) {
        setSelectedQR({
          name: device.device_name,
          content: response.qr_code
        })
        setSelectedConfig(null)
        setIsPreviewOpen(true)
      } else {
        toast.error("QR code not available")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load QR code")
    }
  }

  const handleDownloadQR = (name: string, base64: string) => {
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${base64}`
    a.download = `wg-${name.replace(/\s+/g, '-').toLowerCase()}-qr.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success("QR code downloaded")
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
                                    onClick={() => handleViewConfig(deviceId)}
                                    className="flex-1"
                                  >
                                    <IconFileText className="h-4 w-4 mr-2" />
                                    Config
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewQR(deviceId)}
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedConfig ? `WireGuard Config: ${selectedConfig.name}` : `QR Code: ${selectedQR?.name}`}
            </DialogTitle>
            <DialogDescription>
              {selectedConfig
                ? "Copy or download your configuration file below."
                : "Scan this QR code with your WireGuard app."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4">
            {selectedConfig && (
              <div className="relative">
                <pre className="p-4 bg-muted rounded-md font-mono text-xs overflow-x-auto border">
                  {selectedConfig.content}
                </pre>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => copyToClipboard(selectedConfig.content)}
                  >
                    {copied ? <IconCheck className="h-4 w-4 text-green-500" /> : <IconCopy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {selectedQR && (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border">
                <img
                  src={`data:image/png;base64,${selectedQR.content}`}
                  alt="WireGuard QR Code"
                  className="max-w-xs h-auto shadow-sm border border-gray-100 p-2"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            {selectedConfig && (
              <Button onClick={() => handleDownloadConfig(selectedConfig.name, selectedConfig.content)}>
                <IconDownload className="h-4 w-4 mr-2" />
                Download .conf
              </Button>
            )}
            {selectedQR && (
              <Button onClick={() => handleDownloadQR(selectedQR.name, selectedQR.content)}>
                <IconDownload className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
