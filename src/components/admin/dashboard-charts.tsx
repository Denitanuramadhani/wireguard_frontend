"use client"

import * as React from "react"
import { TrendingUp, PieChart, Activity } from "lucide-react"
import { Label, Pie, PieChart as RePieChart, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface DashboardChartsProps {
    stats: {
        activePeers: number
        totalPeers: number
    }
    trafficData: any[]
}

export function DashboardCharts({ stats, trafficData }: DashboardChartsProps) {
    const donutData = [
        { name: "Active", value: stats.activePeers, fill: "#10b981" }, // Emerald 500
        { name: "Inactive", value: stats.totalPeers - stats.activePeers, fill: "#64748b" }, // Slate 500
    ]

    const chartConfig = {
        active: {
            label: "Active",
            color: "hsl(var(--primary))",
        },
        inactive: {
            label: "Inactive",
            color: "hsl(var(--muted))",
        },
        traffic: {
            label: "Traffic",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig

    return (
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2">
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Active Peers vs Total Peers</CardTitle>
                    <CardDescription>Current Peer Connection Status</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
                        <RePieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={donutData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {stats.activePeers}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-xs"
                                                    >
                                                        Active Peers
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </RePieChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none">
                        Network active <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Total {stats.totalPeers} registered peers
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Network Traffic</CardTitle>
                    <CardDescription>
                        Showing traffic activity for the last 24 hours (in MB)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <AreaChart
                            data={trafficData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                                dataKey="traffic"
                                type="natural"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.4}
                                stroke="hsl(var(--primary))"
                                stackId="a"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm text-muted-foreground">
                        Traffic usage across all devices
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
