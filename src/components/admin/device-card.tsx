"use client"

import { Monitor, Smartphone, Laptop, Server, Cpu, Globe, Activity, ShieldCheck, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Device {
    device_id: number
    device_name: string
    vpn_ip: string
    ldap_uid: string
    status: string
    os_type?: string
    ram_usage?: string
    os_version?: string
    created_at: string
}

const OS_ICONS: Record<string, any> = {
    windows: Monitor,
    mac: Laptop,
    linux: Server,
    android: Smartphone,
    ios: Smartphone,
    default: Cpu
}

export function DeviceCard({ device, onRevoke }: { device: Device, onRevoke: (id: number) => void }) {
    const Icon = OS_ICONS[device.os_type?.toLowerCase() || 'default'] || OS_ICONS.default
    const isActive = device.status === 'active'

    return (
        <Card className="group relative overflow-hidden border-muted-foreground/10 transition-all hover:shadow-xl hover:border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{device.device_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                <span>{device.vpn_ip}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="relative">
                            {isActive && (
                                <span className="absolute -left-3 top-2 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            )}
                            <Badge variant={isActive ? "default" : "secondary"} className={
                                isActive ? "bg-green-500/10 text-green-600 border-green-500/20" : ""
                            }>
                                {isActive ? "Online" : "Offline"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="p-2 rounded-lg bg-muted/30 flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">OS Version</span>
                        <span className="text-sm font-medium truncate">{device.os_version || '10.0.1'}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30 flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">RAM Usage</span>
                        <Badge variant="outline" className="w-fit text-[10px] bg-primary/5 border-primary/10">
                            {device.ram_usage || '1.2 GB'}
                        </Badge>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-muted-foreground/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Owner</span>
                        <span className="text-sm font-semibold">@{device.ldap_uid}</span>
                    </div>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => onRevoke(device.device_id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Revoke Access</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    )
}
