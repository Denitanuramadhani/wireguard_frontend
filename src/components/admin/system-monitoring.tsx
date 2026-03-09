"use client"

import { useState, useEffect } from "react"
import { Cpu, MemoryStick as Memory, Clock, Terminal, Activity, ShieldCheck, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SystemLog {
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
}

export function SystemMonitoring({ stats }: { stats: any }) {
    const [uptime, setUptime] = useState("0d 0h 0m 0s")

    const mockLogs: SystemLog[] = [
        { timestamp: new Date().toISOString(), level: 'info', message: 'WireGuard service started successfully.' },
        { timestamp: new Date(Date.now() - 5000).toISOString(), level: 'info', message: 'New peer connection established from 192.168.1.5' },
        { timestamp: new Date(Date.now() - 15000).toISOString(), level: 'warn', message: 'High CPU usage detected on core #2' },
        { timestamp: new Date(Date.now() - 30000).toISOString(), level: 'error', message: 'Failed handshake from peer index 42' },
        { timestamp: new Date(Date.now() - 45000).toISOString(), level: 'info', message: 'Configuration sync completed.' },
    ]

    useEffect(() => {
        const start = Date.now() - (stats.uptime_seconds || 86450) * 1000
        const interval = setInterval(() => {
            const diff = Date.now() - start
            const d = Math.floor(diff / (1000 * 60 * 60 * 24))
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
            const m = Math.floor((diff / (1000 * 60)) % 60)
            const s = Math.floor((diff / 1000) % 60)
            setUptime(`${d}d ${h}h ${m}m ${s}s`)
        }, 1000)
        return () => clearInterval(interval)
    }, [stats.uptime_seconds])

    return (
        <div className="space-y-6 px-4 lg:px-6">
            {/* Top Section: Health Gauges & Uptime */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CPU Usage */}
                <Card className="bg-background/50 backdrop-blur-md border-muted-foreground/10 overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="flex items-center gap-2 group-hover:text-blue-500 transition-colors duration-300">
                                <Cpu className="h-4 w-4 text-blue-500 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6" />
                                <span className="font-bold uppercase tracking-wider text-[10px]">CPU Usage</span>
                            </CardDescription>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 group-hover:bg-blue-500/20 transition-all font-bold">
                                {stats.cpu_usage || '12%'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between mt-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-1000 group-hover:brightness-125"
                                    style={{ width: stats.cpu_usage || '12%' }}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Load Average: 0.45 0.32 0.12</p>
                    </CardContent>
                </Card>

                {/* RAM Usage */}
                <Card className="bg-background/50 backdrop-blur-md border-muted-foreground/10 overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-500/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="flex items-center gap-2 group-hover:text-purple-500 transition-colors duration-300">
                                <Memory className="h-4 w-4 text-purple-500 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6" />
                                <span className="font-bold uppercase tracking-wider text-[10px]">Memory Usage</span>
                            </CardDescription>
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 group-hover:bg-purple-500/20 transition-all font-bold">
                                {stats.memory_usage || '2.4 GB'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between mt-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-1000 group-hover:brightness-125"
                                    style={{ width: '45%' }}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Total: 8GB | Free: 5.6GB</p>
                    </CardContent>
                </Card>

                {/* Uptime */}
                <Card className="bg-primary text-primary-foreground shadow-xl shadow-primary/20 group transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardDescription className="text-primary-foreground/80 flex items-center gap-2 group-hover:text-white transition-colors">
                            <Clock className="h-4 w-4 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6" />
                            <span className="font-bold uppercase tracking-wider text-[10px]">System Uptime</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-black tracking-tighter tabular-nums mt-1 uppercase group-hover:scale-105 transition-transform origin-left duration-300">
                            {uptime}
                        </div>
                        <p className="text-[10px] text-primary-foreground/60 mt-2 uppercase font-bold tracking-widest group-hover:text-primary-foreground/80 transition-colors">Since last reboot: 2024-03-01</p>
                    </CardContent>
                </Card>
            </div>

            {/* Log Console */}
            <Card className="bg-slate-950 border-slate-800 shadow-2xl overflow-hidden group transition-all duration-500 hover:border-emerald-500/30 hover:shadow-emerald-500/5">
                <CardHeader className="border-b border-slate-800 bg-slate-900/50 flex flex-row items-center justify-between py-3 transition-colors group-hover:bg-slate-900/80">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-emerald-500 transition-transform duration-300 group-hover:scale-115" />
                        <span className="text-sm font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">Live System Console</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors" />
                        <div className="h-2 w-2 rounded-full bg-yellow-500/50 group-hover:bg-yellow-500 transition-colors" />
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse-glow" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[300px] overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
                        {mockLogs.map((log, i) => (
                            <div key={i} className="flex gap-4 group/line py-0.5">
                                <span className="text-slate-600 shrink-0 select-none">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className={`font-bold shrink-0 text-[10px] ${log.level === 'error' ? 'text-red-400' :
                                    log.level === 'warn' ? 'text-yellow-400' : 'text-emerald-400'
                                    }`}>
                                    [{log.level.toUpperCase()}]
                                </span>
                                <span className="text-slate-300 group-hover/line:text-white transition-colors duration-200">{log.message}</span>
                            </div>
                        ))}
                        <div className="flex gap-4 animate-pulse opacity-50">
                            <span className="text-slate-600 shrink-0">{new Date().toLocaleTimeString()}</span>
                            <span className="text-emerald-400 font-bold">_</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
