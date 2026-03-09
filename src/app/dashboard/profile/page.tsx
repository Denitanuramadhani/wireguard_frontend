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
import { IconUser, IconShield, IconDeviceMobile, IconCircleCheck, IconLock } from "@tabler/icons-react"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<any>(null)
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
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      const currentUser = await api.getCurrentUser() as any
      setProfileData(currentUser)
    } catch (error: any) {
      toast.error(error.message || "Failed to load profile")
      setProfileData(null)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center group">
          <div className="relative h-12 w-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="mt-6 text-sm font-bold tracking-widest text-muted-foreground uppercase animate-pulse">Syncing Profile...</p>
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-1 flex-col"
        >
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-8 md:gap-10 md:py-12 items-center">

              <div className="w-full max-w-3xl px-4 lg:px-6">
                <div className="mb-8 flex items-end gap-6">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-xl shadow-primary/20 transform transition-transform group-hover:scale-105 duration-300">
                      <IconUser className="h-12 w-12" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-emerald-500 border-4 border-white dark:border-zinc-950 flex items-center justify-center text-white shadow-lg">
                      <IconCircleCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="pb-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                      {profileData?.cn || profileData?.username || user?.username}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                      Account Managed via <span className="text-primary font-bold">LDAP Secure</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                  {[
                    { label: "Identity", value: profileData?.username || user?.username, icon: IconUser, color: "blue" },
                    { label: "Status", value: "Verified", icon: IconCircleCheck, color: "emerald" },
                    { label: "Security", value: profileData?.role?.toUpperCase() || "USER", icon: IconShield, color: "indigo" }
                  ].map((item, i) => (
                    <Card key={i} className="border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:border-zinc-800/60 dark:bg-zinc-950">
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                          <item.icon className={`h-3 w-3 ${item.color === 'emerald' ? 'text-emerald-500' :
                              item.color === 'blue' ? 'text-blue-500' : 'text-indigo-500'
                            }`} />
                          {item.label}
                        </CardDescription>
                        <CardTitle className="text-lg font-bold truncate">
                          {loading ? "..." : item.value}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                <Card className="border border-slate-200/60 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950 overflow-hidden">
                  <CardHeader className="border-b border-slate-50 dark:border-zinc-900/50 pb-6">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <IconLock className="h-5 w-5 text-primary" />
                      Security & Metadata
                    </CardTitle>
                    <CardDescription>System-level attributes and access control details</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50 dark:divide-zinc-900/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Common Name (CN)</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Your official name recorded in the directory</p>
                        </div>
                        <p className="mt-2 sm:mt-0 font-mono text-sm bg-slate-100 dark:bg-zinc-900 px-3 py-1 rounded-lg border border-slate-200/50 dark:border-zinc-800/50">
                          {loading ? "Loading..." : profileData?.cn || "Not provided"}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Access Role</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Defines your authorization level across the platform</p>
                        </div>
                        <Badge
                          className={`${profileData?.role === 'admin'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-none'
                            } h-7 px-4 rounded-full font-bold text-[10px] uppercase tracking-wider`}
                        >
                          {loading ? "..." : profileData?.role || "user"}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Authentication Source</p>
                          <p className="text-xs text-muted-foreground mt-0.5">The engine used to verify your identity</p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                          <IconCircleCheck className="h-4 w-4" />
                          Secure LDAP Connection
                        </div>
                      </div>
                    </div>
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
