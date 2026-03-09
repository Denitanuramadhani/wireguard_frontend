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
import { Button } from "@/components/ui/button"
import { RefreshCw, LayoutGrid } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { PeersTable } from "@/components/admin/peers-table"

export default function AdminPeersPage() {
    const { user, loading: authLoading, isAdmin } = useAuth()
    const router = useRouter()
    const [peers, setPeers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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
            loadPeers()
        }
    }, [user, isAdmin])

    const loadPeers = async () => {
        try {
            setLoading(true)
            const response = await api.getAdminPeers() as any
            setPeers(Array.isArray(response) ? response : (response.peers || []))
        } catch (error: any) {
            toast.error(error.message || "Failed to load peers data")
            setPeers([])
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || !user || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                <div className="flex flex-1 flex-col pb-10">
                    <div className="px-4 lg:px-6 pt-8">
                        {/* Header */}
                        <div className="relative mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90">
                                    Peer Management
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Real-time WireGuard session monitoring and cryptographic peer keys.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={loadPeers}
                                    disabled={loading}
                                    className="h-11 px-5 border-muted-foreground/20 hover:bg-muted/50 rounded-xl transition-all"
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    Sync Peers
                                </Button>
                                <Button className="h-11 px-5 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl transition-all hover:scale-[1.02]">
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    View Topology
                                </Button>
                            </div>
                            <div className="absolute -bottom-4 left-0 w-32 h-1.5 bg-primary/30 rounded-full" />
                        </div>

                        {/* Peers Table */}
                        <PeersTable peers={peers} loading={loading} />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
