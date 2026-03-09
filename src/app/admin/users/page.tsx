"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { UserManagement } from "@/components/user-management"
import { Separator } from "@/components/ui/separator"

export default function AdminUsersPage() {
    const { user, loading, isAdmin } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
            } else if (!isAdmin) {
                router.push('/dashboard')
            }
        }
    }, [user, loading, isAdmin, router])

    if (loading || !user || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground font-medium">Loading User Records...</p>
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
                <div className="flex flex-1 flex-col pb-10">
                    <div className="px-4 lg:px-6 pt-8 pb-4">
                        <div className="relative mb-8">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90">
                                    User Management
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Configure access levels and manage network participants.
                                </p>
                            </div>
                            <div className="absolute -bottom-4 left-0 w-32 h-1.5 bg-primary/20 rounded-full" />
                        </div>

                        <Separator className="mb-8 opacity-50" />

                        <div className="mt-6">
                            <UserManagement />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
