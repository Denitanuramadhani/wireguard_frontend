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

  async function handleViewQR(deviceId: number) {
    try {
      const response = await api.getDeviceQR(deviceId) as any
      // Open QR code in new window or show in modal
      if (response.qr_code) {
        const qrUrl = `data:image/png;base64,${response.qr_code}`
        window.open(qrUrl, '_blank')
      } else if (response.qr_url) {
        window.open(response.qr_url, '_blank')
      } else {
        toast.info("QR code data not available. Try regenerating the QR code.")
      }
    } catch (error: any) {
      if (error.message?.includes('expired') || error.message?.includes('regenerate')) {
        toast.error(error.message || "QR code expired. Please regenerate it.")
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
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "transfer_total",
      header: "Total Traffic",
      cell: (row: any) => {
        const bytes = row.transfer_total || 0
        if (bytes >= 1024 * 1024 * 1024) {
          return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
        } else if (bytes >= 1024 * 1024) {
          return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        } else if (bytes >= 1024) {
          return `${(bytes / 1024).toFixed(2)} KB`
        }
        return `${bytes} B`
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: (row: any) => {
        const date = new Date(row.created_at)
        return date.toLocaleDateString()
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
                  onClick={() => handleViewQR(row.id)}
                >
                  <IconQrcode className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRevokeDevice(row.id)}
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Card className="mx-4 lg:mx-6">
                <CardHeader>
                  <CardTitle>Add New Device</CardTitle>
                  <CardDescription>
                    Create a new VPN device configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Device name (e.g., My Laptop)"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddDevice()
                        }
                      }}
                    />
                    <Button onClick={handleAddDevice} disabled={adding}>
                      <IconPlus className="h-4 w-4 mr-2" />
                      {adding ? "Adding..." : "Add Device"}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
