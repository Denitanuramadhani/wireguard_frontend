"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity } from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { EmptyState } from "@/components/ui/empty-state"

interface ChartAreaInteractiveProps {
  data?: Array<{ date: string; traffic?: number }>
  loading?: boolean
}

export function ChartAreaInteractive({ data, loading }: ChartAreaInteractiveProps = {}) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("24h")
  const [hours, setHours] = React.useState(24)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("24h")
      setHours(24)
    }
  }, [isMobile])

  React.useEffect(() => {
    if (timeRange === "7d") setHours(168)
    else if (timeRange === "24h") setHours(24)
    else if (timeRange === "1h") setHours(1)
  }, [timeRange])

  const chartDataToUse = data && data.length > 0
    ? data.map(item => ({
      date: item.date,
      traffic: item.traffic || 0,
    }))
    : []

  const filteredData = chartDataToUse.length > 0
    ? chartDataToUse.filter((item) => {
      const date = new Date(item.date)
      const now = new Date()
      const hoursAgo = now.getTime() - (hours * 60 * 60 * 1000)
      return date.getTime() >= hoursAgo
    })
    : []

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card border-muted-foreground/10 bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle className="text-xl font-bold">Traffic Analytics</CardTitle>
            <CardDescription>Network traffic over time</CardDescription>
          </div>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
              <ToggleGroupItem value="24h">Last 24 hours</ToggleGroupItem>
              <ToggleGroupItem value="1h">Last hour</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Last 24 hours" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
                <SelectItem value="24h" className="rounded-lg">
                  Last 24 hours
                </SelectItem>
                <SelectItem value="1h" className="rounded-lg">
                  Last hour
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length > 0 ? (
          <ChartContainer
            config={{
              traffic: {
                label: "Traffic",
                color: "var(--primary)",
              },
            }}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
              />
              <ChartTooltip
                cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleString("en-US")
                    }}
                    indicator="dot"
                    formatter={(value: any) => {
                      const bytes = Number(value)
                      if (bytes >= 1024 * 1024 * 1024) {
                        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
                      } else if (bytes >= 1024 * 1024) {
                        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
                      } else if (bytes >= 1024) {
                        return `${(bytes / 1024).toFixed(2)} KB`
                      }
                      return `${bytes} B`
                    }}
                  />
                }
              />
              <Area
                dataKey="traffic"
                type="natural"
                fill="url(#fillTraffic)"
                stroke="var(--primary)"
                strokeWidth={2}
                animationDuration={1500}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <EmptyState
            icon={Activity}
            title="No throughput data available"
            description="Real-time network traffic metrics will appear here once data starts flowing through your tunnel endpoints."
            className="py-12"
          />
        )}
      </CardContent>
    </Card>
  )
}
