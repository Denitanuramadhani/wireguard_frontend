"use client"

import { IconDeviceMobile, IconUsers, IconActivity } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatBytes } from "@/lib/utils"

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
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] rounded-xl border border-slate-200/60 bg-white/50 p-6 dark:border-zinc-800/60 dark:bg-zinc-900/50">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
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
      color: "blue"
    },
    {
      title: "Active Devices",
      value: stats.activeDevices,
      description: "Currently connected devices",
      icon: IconActivity,
      color: "emerald"
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Users with VPN access",
      icon: IconUsers,
      color: "indigo"
    },
    {
      title: "Total Traffic",
      value: formatBytes(stats.totalTraffic),
      description: "Data sent across all tunnels",
      icon: IconActivity,
      color: "orange"
    },
  ] : [
    {
      title: "My Devices",
      value: stats.totalDevices,
      description: "Your registered devices",
      icon: IconDeviceMobile,
      color: "blue"
    },
    {
      title: "Active Devices",
      value: stats.activeDevices,
      description: "Currently connected",
      icon: IconActivity,
      color: "emerald"
    },
    {
      title: "Total Traffic",
      value: formatBytes(stats.totalTraffic),
      description: "Your total data usage",
      icon: IconActivity,
      color: "orange"
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="group relative overflow-hidden border border-slate-200/60 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10 dark:border-zinc-800/60 dark:bg-zinc-950 dark:hover:border-primary/40">
            <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${card.color === 'emerald' ? 'from-emerald-500 to-teal-400' :
              card.color === 'blue' ? 'from-blue-500 to-indigo-400' :
                'from-primary to-primary/60'
              } opacity-0 transition-opacity group-hover:opacity-100`} />

            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between font-medium text-muted-foreground">
                <span className="flex items-center gap-2 group-hover:text-foreground transition-colors">
                  <span className={`p-1.5 rounded-lg bg-slate-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${card.color === 'emerald' ? 'group-hover:bg-emerald-500/10 group-hover:text-emerald-600' :
                    card.color === 'blue' ? 'group-hover:bg-blue-500/10 group-hover:text-blue-600' :
                      'group-hover:bg-primary/10 group-hover:text-primary'
                    } dark:bg-zinc-900`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {card.title}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 group-hover:bg-primary/40 transition-colors" />
              </CardDescription>
              <CardTitle className="mt-2 text-2xl font-bold tracking-tight tabular-nums group-hover:text-primary transition-colors">
                {card.value}
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-4">
              <div className="text-xs font-medium text-muted-foreground group-hover:text-muted-foreground/80 transition-colors uppercase tracking-wider">
                {card.description}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
