"use client"

import { IconDeviceMobile, IconUsers, IconShield, IconActivity } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Stats {
  totalDevices: number
  activeDevices: number
  totalUsers: number
  totalTraffic: number
}

export function SectionCards({ 
  stats, 
  loading, 
  isAdmin 
}: { 
  stats: Stats
  loading: boolean
  isAdmin: boolean 
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  const cards = isAdmin ? [
    {
      title: "Total Devices",
      value: stats.totalDevices,
      description: "All registered VPN devices",
      icon: IconDeviceMobile,
    },
    {
      title: "Active Devices",
      value: stats.activeDevices,
      description: "Currently connected devices",
      icon: IconActivity,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Users with VPN access",
      icon: IconUsers,
    },
    {
      title: "System Status",
      value: "Healthy",
      description: "All systems operational",
      icon: IconShield,
    },
  ] : [
    {
      title: "My Devices",
      value: stats.totalDevices,
      description: "Your registered devices",
      icon: IconDeviceMobile,
    },
    {
      title: "Active Devices",
      value: stats.activeDevices,
      description: "Currently connected",
      icon: IconActivity,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {card.title}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">
                {card.description}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
