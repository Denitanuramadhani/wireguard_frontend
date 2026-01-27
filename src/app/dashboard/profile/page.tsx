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
import { IconUser, IconMail, IconShield, IconDeviceMobile } from "@tabler/icons-react"

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
                    <CardTitle className="flex items-center gap-2">
                      <IconUser className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>Your account details and information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Username</label>
                        <p className="text-lg font-semibold mt-1">
                          {loading ? "Loading..." : profileData?.username || user?.username || "-"}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <IconShield className="h-4 w-4" />
                          Role
                        </label>
                        <div className="mt-1">
                          <Badge variant={profileData?.role === "admin" ? "default" : "secondary"}>
                            {loading ? "Loading..." : profileData?.role || "user"}
                          </Badge>
                        </div>
                      </div>

                      {profileData?.cn && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                          <p className="text-lg font-semibold mt-1">{profileData.cn}</p>
                        </div>
                      )}

                      {profileData?.mail && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <IconMail className="h-4 w-4" />
                            Email
                          </label>
                          <p className="text-lg font-semibold mt-1">{profileData.mail}</p>
                        </div>
                      )}
                    </div>
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
