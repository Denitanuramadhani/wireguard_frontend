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
import { motion } from "framer-motion"

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
          <code className="text-xs bg-slate-100 dark:bg-zinc-900 px-2 py-1 rounded font-mono border border-slate-200/50 dark:border-zinc-800/50">
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
                  Network Peers
                </h1>
                <p className="text-muted-foreground mt-2 text-md">
                  Monitor active WireGuard peer connections and traffic metrics.
                </p>
              </div>

              <div className="px-4 lg:px-6">
                <Card className="border border-slate-200/60 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <CardHeader className="pb-6 border-b border-slate-50 dark:border-zinc-900/50">
                    <CardTitle className="text-xl font-bold">Active Connections</CardTitle>
                    <CardDescription>
                      Connected devices and their current network status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
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
        </motion.div>
      </SidebarInset>
    </SidebarProvider>
  )
}
