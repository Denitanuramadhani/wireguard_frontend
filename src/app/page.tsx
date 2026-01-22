"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function Home() {
  const router = useRouter()
  const { user, loading, isAdmin } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (isAdmin) {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, loading, isAdmin, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
