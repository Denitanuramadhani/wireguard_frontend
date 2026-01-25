"use client"

import { useState, useEffect } from "react"
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
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Peer {
  public_key: string
  allowed_ips: string
  transfer_rx?: number
  transfer_tx?: number
  last_handshake?: string
}

export default function PeersPage() {
  const [peers, setPeers] = useState<Peer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPeers()
  }, [])

  const loadPeers = async () => {
    try {
      setLoading(true)
      const response = await api.getPeers() as any
      const peersList = Array.isArray(response) ? response : (response.peers || [])
      setPeers(peersList)
    } catch (error: any) {
      toast.error(error.message || "Failed to load peers")
      setPeers([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      accessorKey: "public_key",
      header: "Public Key",
      cell: (row: any) => {
        const key = row.public_key || ""
        return (
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {key.substring(0, 20)}...
          </code>
        )
      },
    },
    {
      accessorKey: "allowed_ips",
      header: "Allowed IPs",
    },
    {
      accessorKey: "transfer_rx",
      header: "Received",
      cell: (row: any) => {
        const bytes = row.transfer_rx || 0
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
      accessorKey: "transfer_tx",
      header: "Sent",
      cell: (row: any) => {
        const bytes = row.transfer_tx || 0
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
      accessorKey: "last_handshake",
      header: "Last Handshake",
      cell: (row: any) => {
        if (!row.last_handshake) return "Never"
        const date = new Date(row.last_handshake)
        return date.toLocaleString()
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
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>WireGuard Peers</CardTitle>
                    <CardDescription>
                      Active WireGuard peer connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleTable 
                      data={peers} 
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
