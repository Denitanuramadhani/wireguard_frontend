"use client"

import { Users, Satellite, Activity, Share2, ShieldCheck, Monitor } from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStatsProps {
    stats: {
        totalUsers: number
        totalPeers: number
        activePeers: number
        totalTraffic: string
        systemStatus: string
        totalDevices: number
    }
    loading?: boolean
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-lg" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }
    const cards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-500",
        },
        {
            title: "Total Peers",
            value: stats.totalPeers,
            icon: Satellite,
            color: "text-purple-500",
        },
        {
            title: "Active Peers",
            value: stats.activePeers,
            icon: Activity,
            color: "text-green-500",
        },
        {
            title: "Total Data Sent",
            value: stats.totalTraffic,
            icon: Share2,
            color: "text-orange-500",
        },
        {
            title: "Alerts/System Status",
            value: stats.systemStatus,
            icon: ShieldCheck,
            color: "text-emerald-500",
        },
        {
            title: "Total Devices",
            value: stats.totalDevices,
            icon: Monitor,
            color: "text-indigo-500",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <Card
                        key={index}
                        className="overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 group"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${card.color.replace('text-', 'bg-')}/10`}>
                                <Icon className={`h-4 w-4 transition-all duration-300 group-hover:scale-115 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-primary">
                                {card.value}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
