"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard for preview (no auth required)
    router.push("/dashboard")
  }, [router])

  return null
}
