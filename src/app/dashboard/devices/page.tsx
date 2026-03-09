"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SimpleTable } from "@/components/simple-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconQrcode, IconTrash } from "@tabler/icons-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface Device {
  id?: number
  device_id?: number
  device_name: string
  vpn_ip: string
  status: string
  created_at: string
  last_seen?: string
  transfer_rx?: number
  transfer_tx?: number
  transfer_total?: number
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [deviceName, setDeviceName] = useState("")
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      setLoading(true)
      const response = await api.getMyDevices() as any
      const devicesList = Array.isArray(response) ? response : (response.devices || [])
      setDevices(devicesList)
    } catch (error: any) {
      toast.error(error.message || "Failed to load devices")
      setDevices([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAddDevice() {
    if (!deviceName.trim()) {
      toast.error("Please enter a device name")
      return
    }

    try {
      setAdding(true)
      await api.addDevice(deviceName.trim())
      toast.success("Device added successfully")
      setDeviceName("")
      loadDevices()
    } catch (error: any) {
      toast.error(error.message || "Failed to add device")
    } finally {
      setAdding(false)
    }
  }

  async function handleRevokeDevice(deviceId: number) {
    if (!confirm("Are you sure you want to revoke this device?")) {
      return
    }

    try {
      await api.revokeDevice(deviceId)
      toast.success("Device revoked successfully")
      loadDevices()
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke device")
    }
  }

  const downloadQR = (base64: string, deviceName: string) => {
    const link = document.createElement("a")
    link.href = `data:image/png;base64,${base64}`
    link.download = `wireguard-${deviceName.replace(/\s+/g, '-').toLowerCase()}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function handleRegenerateQR(deviceId: number) {
    const device = devices.find(d => (d.device_id || d.id) === deviceId)
    const name = device?.device_name || "device"

    try {
      const response = await api.regenerateQR(deviceId) as any
      if (response.qr_code) {
        downloadQR(response.qr_code, name)
        toast.success("QR code regenerated and downloaded")
      } else {
        toast.error("Failed to regenerate QR code: No data received")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate QR code")
    }
  }

  async function handleViewQR(deviceId: number) {
    const device = devices.find(d => (d.device_id || d.id) === deviceId)
    const name = device?.device_name || "device"

    try {
      const response = await api.getDeviceQR(deviceId) as any
      if (response.qr_code) {
        downloadQR(response.qr_code, name)
        toast.success("QR code downloaded")
      } else if (response.qr_url) {
        window.open(response.qr_url, '_blank')
      } else if (response.expired) {
        if (confirm("QR code has expired. Would you like to regenerate it?")) {
          handleRegenerateQR(deviceId)
        }
      } else {
        toast.info("QR code data not available. Try regenerating the QR code.")
      }
    } catch (error: any) {
      if (error.message?.includes('expired') || error.message?.includes('regenerate')) {
        if (confirm("QR code is not available or expired. Regenerate now?")) {
          handleRegenerateQR(deviceId)
        }
      } else {
        toast.error(error.message || "Failed to load QR code")
      }
    }
  }

  // Transform devices data for table
  const tableData = devices.map((device) => ({
    id: device.device_id || device.id,
    device_name: device.device_name,
    vpn_ip: device.vpn_ip,
    status: device.status,
    created_at: device.created_at,
    last_seen: device.last_seen,
    transfer_rx: device.transfer_rx || 0,
    transfer_tx: device.transfer_tx || 0,
    transfer_total: device.transfer_total || 0,
  }))

  const columns = [
    {
      accessorKey: "device_name",
      header: "Device Name",
    },
    {
      accessorKey: "vpn_ip",
      header: "VPN IP",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row: any) => {
        const status = row.status
        const isActive = status === "active"
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={`${isActive
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-100/80 dark:bg-zinc-800 dark:text-zinc-400"
                } border-none rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider transition-all`}
            >
              {isActive && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {status}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "transfer_total",
      header: "Total Usage",
      cell: (row: any) => {
        const bytes = row.transfer_total || 0
        const formatted = bytes >= 1024 * 1024 * 1024
          ? `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
          : bytes >= 1024 * 1024
            ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
            : bytes >= 1024
              ? `${(bytes / 1024).toFixed(2)} KB`
              : `${bytes} B`

        return (
          <span className="font-mono text-xs font-bold text-slate-600 dark:text-zinc-400">
            {formatted}
          </span>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Provisioned",
      cell: (row: any) => {
        const date = new Date(row.created_at)
        return (
          <span className="text-muted-foreground font-medium">
            {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (row: any) => {
        return (
          <div className="flex gap-2">
            {row.status === "active" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  title="View QR Code"
                  onClick={() => handleViewQR(row.id)}
                  className="h-9 w-9 p-0 rounded-xl border-slate-200/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all active:scale-90"
                >
                  <IconQrcode className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  title="Regenerate Config"
                  onClick={() => handleRegenerateQR(row.id)}
                  className="h-9 w-9 p-0 rounded-xl border-slate-200/60 hover:bg-amber-500/5 hover:text-amber-600 hover:border-amber-500/30 transition-all active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  title="Revoke Device"
                  onClick={() => handleRevokeDevice(row.id)}
                  className="h-9 w-9 p-0 rounded-xl shadow-sm hover:shadow-destructive/20 hover:scale-105 transition-all active:scale-90"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
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
                  My Devices
                </h1>
                <p className="text-muted-foreground mt-2 text-md">
                  Manage your WireGuard VPN devices and secure configurations.
                </p>
              </div>

              <Card className="mx-4 lg:mx-6 border border-slate-200/60 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <IconPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Add New Device</CardTitle>
                      <CardDescription>
                        Create a secure VPN configuration for your device
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="e.g. MacBook Pro, Android Phone..."
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      className="h-11 bg-slate-50 border-slate-200/60 focus:bg-white transition-all dark:bg-zinc-900 dark:border-zinc-800"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddDevice()
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddDevice}
                      disabled={adding}
                      className="h-11 px-6 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      {adding ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <>
                          <IconPlus className="h-4 w-4 mr-2" />
                          Provision Device
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="px-4 lg:px-6">
                <SimpleTable
                  data={tableData}
                  columns={columns}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </SidebarInset>
    </SidebarProvider>
  )
}
