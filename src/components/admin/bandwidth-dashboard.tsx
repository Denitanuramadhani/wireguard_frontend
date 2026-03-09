"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowUpCircle, ArrowDownCircle, Zap, Activity, Globe, HardDrive } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

const data = [
    { time: "00:00", upload: 400, download: 2400 },
    { time: "04:00", upload: 300, download: 1398 },
    { time: "08:00", upload: 200, download: 9800 },
    { time: "12:00", upload: 278, download: 3908 },
    { time: "16:00", upload: 189, download: 4800 },
    { time: "20:00", upload: 239, download: 3800 },
    { time: "23:59", upload: 349, download: 4300 },
]

const chartConfig = {
    upload: {
        label: "Upload",
        color: "hsl(var(--primary))",
    },
    download: {
        label: "Download",
        color: "hsl(270 70% 50%)",
    },
} satisfies ChartConfig

interface BandwidthDashboardProps {
    stats?: {
        peak_speed?: string
        total_usage?: string
        current_load?: string
        quota_percent?: number
        recorded_at?: string
    }
    history?: Array<{
        time: string
        upload: number
        download: number
    }>
}

export function BandwidthDashboard({ stats, history }: BandwidthDashboardProps) {
    // Default fallback data if none provided
    const chartData = history && history.length > 0 ? history : [
        { time: "00:00", upload: 0, download: 0 },
        { time: "23:59", upload: 0, download: 0 },
    ]

    return (
        <div className="space-y-6">
            {/* Quick Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
                <Card className="bg-background/50 border-muted-foreground/10 hover:border-primary/20 transition-all">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Peak Speed
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats?.peak_speed || "0.0 Mbps"}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">
                            {stats?.recorded_at ? `Recorded at ${stats.recorded_at}` : "No peak recorded today"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-background/50 border-muted-foreground/10 hover:border-primary/20 transition-all">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-blue-500" />
                            Total Monthly Usage
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-blue-500">{stats?.total_usage || "0 GB"}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">
                            {stats?.quota_percent !== undefined ? `${stats.quota_percent}% of quota consumed` : "Dynamic quota allocation"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-background/50 border-muted-foreground/10 hover:border-primary/20 transition-all">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-500" />
                            Current Load
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-500">{stats?.current_load || "0.0 Mbps"}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">Stable connection status</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Hero Chart */}
            <Card className="border-muted-foreground/10 shadow-xl bg-background/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Real-time Traffic Flow</CardTitle>
                        <CardDescription>Network throughput comparing Inbound vs Outbound data.</CardDescription>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="text-xs font-semibold text-muted-foreground">Upload</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-[hsl(270,70%,50%)]" />
                            <span className="text-xs font-semibold text-muted-foreground">Download</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-2 pt-4">
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
                            <defs>
                                <linearGradient id="fillUpload" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-upload)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-upload)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="fillDownload" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-download)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-download)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                                tickFormatter={(val) => `${(val / 1024).toFixed(1)}K`}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Area
                                dataKey="upload"
                                type="natural"
                                fill="url(#fillUpload)"
                                stroke="var(--color-upload)"
                                strokeWidth={3}
                                stackId="a"
                            />
                            <Area
                                dataKey="download"
                                type="natural"
                                fill="url(#fillDownload)"
                                stroke="var(--color-download)"
                                strokeWidth={3}
                                stackId="b"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}

