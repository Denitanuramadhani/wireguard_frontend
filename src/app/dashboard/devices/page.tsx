"use client"

import { useState } from "react"
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
import { dummyDevices } from "@/lib/dummy-data"
import { toast } from "sonner"

export default function DevicesPage() {
  // Using dummy data for preview
  const devices = dummyDevices
  const [deviceName, setDeviceName] = useState("")
  const [adding, setAdding] = useState(false)

  function handleAddDevice() {
    if (!deviceName.trim()) {
      toast.info("Please enter a device name")
      return
    }
    toast.info("Add device functionality will be available after backend integration")
    setDeviceName("")
  }

  function handleRevokeDevice(deviceId: number) {
    toast.info("Revoke device functionality will be available after backend integration")
  }

  function handleViewQR(deviceId: number) {
    toast.info("QR code view will be available after backend integration")
  }

  // Transform devices data for table
  const tableData = devices.map((device) => ({
    id: device.id,
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
                  loading={false}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
