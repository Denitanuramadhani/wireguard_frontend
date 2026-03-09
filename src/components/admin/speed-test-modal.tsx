"use client"

import { useState, useEffect, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Activity, Zap, Wifi, SignalHigh, Globe, ArrowUp, ArrowDown } from "lucide-react"

export function SpeedTestModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [download, setDownload] = useState(0)
    const [upload, setUpload] = useState(0)
    const [phase, setPhase] = useState<'idle' | 'download' | 'upload' | 'complete'>('idle')
    const [progress, setProgress] = useState(0)

    const requestRef = useRef<number>()
    const startTimeRef = useRef<number>()

    const runTest = () => {
        setPhase('download')
        setDownload(0)
        setUpload(0)
        setProgress(0)

        const targetDownload = Math.floor(Math.random() * 150) + 820 // 820-970 Mbps
        const targetUpload = Math.floor(Math.random() * 100) + 450 // 450-550 Mbps

        // Phase 1: Download
        let start = Date.now()
        const duration = 4000

        const animate = () => {
            const now = Date.now()
            const elapsed = now - start
            const p = Math.min(elapsed / duration, 1)

            if (phase === 'download') {
                const jitter = Math.sin(now * 0.01) * 5
                setDownload(Math.floor(p * targetDownload + jitter))
                setProgress(p * 50)

                if (p < 1) {
                    requestRef.current = requestAnimationFrame(animate)
                } else {
                    setPhase('upload')
                    start = Date.now()
                    requestRef.current = requestAnimationFrame(animate)
                }
            } else if (phase === 'upload') {
                const clock = now - start
                const upP = Math.min(clock / duration, 1)
                const jitter = Math.sin(now * 0.01) * 3
                setUpload(Math.floor(upP * targetUpload + jitter))
                setProgress(50 + upP * 50)

                if (upP < 1) {
                    requestRef.current = requestAnimationFrame(animate)
                } else {
                    setPhase('complete')
                    cancelAnimationFrame(requestRef.current!)
                }
            }
        }

        requestRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        if (open) {
            runTest()
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [open])

    const currentSpeed = phase === 'upload' ? upload : download
    const maxSpeed = phase === 'upload' ? 600 : 1000
    const rotation = (currentSpeed / maxSpeed) * 180 - 90

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-2xl border-muted-foreground/20 shadow-2xl p-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-muted/20">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-6 pb-0">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Activity className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                            Network Precision Scan
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Analyzing throughput from <span className="text-foreground font-semibold">Singapore SG-1</span> to your local endpoint.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex flex-col items-center justify-center pt-6 pb-10">
                    {/* Modern Gauge Container */}
                    <div className="relative h-64 w-80">
                        {/* Status Glow */}
                        <div className={`absolute inset-0 transition-opacity duration-1000 blur-[80px] rounded-full opacity-20 ${phase === 'download' ? 'bg-emerald-500' : phase === 'upload' ? 'bg-blue-500' : 'bg-primary'
                            }`} />

                        {/* Gauge Arc Background */}
                        <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 100 60">
                            <path
                                d="M10 50 A40 40 0 0 1 90 50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-muted/10"
                                strokeLinecap="round"
                            />
                            <path
                                d="M10 50 A40 40 0 0 1 90 50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray="125.6"
                                strokeDashoffset={125.6 - (currentSpeed / maxSpeed) * 125.6}
                                className={`transition-all duration-300 ease-out ${phase === 'download' ? 'text-emerald-500' : 'text-blue-500'
                                    }`}
                            />
                        </svg>

                        {/* Speed Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-7xl font-black tracking-tighter tabular-nums drop-shadow-sm">
                                    {currentSpeed}
                                </span>
                                <span className="text-xl font-bold text-muted-foreground">Mbps</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-muted-foreground/10 mt-2">
                                {phase === 'upload' ? <ArrowUp className="h-3.5 w-3.5 text-blue-500" /> : <ArrowDown className="h-3.5 w-3.5 text-emerald-500" />}
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {phase === 'upload' ? 'Testing Upload' : phase === 'download' ? 'Testing Download' : 'Scan Complete'}
                                </span>
                            </div>
                        </div>

                        {/* Needle */}
                        <div
                            className="absolute bottom-12 left-1/2 w-1 h-32 origin-bottom transition-transform duration-150 ease-out"
                            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                        >
                            <div className="h-4 w-1 bg-primary rounded-full" />
                        </div>
                    </div>

                    {/* Extended Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full px-10 mt-6">
                        <MetricCard
                            icon={ArrowDown}
                            label="Down"
                            value={download}
                            unit="Mbps"
                            color={phase === 'download' ? 'text-emerald-500' : 'text-muted-foreground'}
                            active={phase === 'download'}
                        />
                        <MetricCard
                            icon={ArrowUp}
                            label="Up"
                            value={upload}
                            unit="Mbps"
                            color={phase === 'upload' ? 'text-blue-500' : 'text-muted-foreground'}
                            active={phase === 'upload'}
                        />
                        <MetricCard icon={SignalHigh} label="Latency" value={11} unit="ms" />
                        <MetricCard icon={Globe} label="Server" value="SGP" unit="" />
                    </div>
                </div>

                <div className="p-6 bg-muted/20 border-t border-muted-foreground/10 flex gap-4">
                    <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                        onClick={runTest}
                        disabled={phase !== 'idle' && phase !== 'complete'}
                    >
                        {phase === 'complete' ? "Run Full Diagnostics Again" : "Initializing..."}
                    </Button>
                    <Button
                        variant="ghost"
                        className="px-6 h-12 font-bold transition-all hover:bg-background"
                        onClick={() => onOpenChange(false)}
                    >
                        Dismiss
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function MetricCard({
    icon: Icon,
    label,
    value,
    unit,
    color = "text-foreground",
    active = false
}: {
    icon: any,
    label: string,
    value: any,
    unit: string,
    color?: string,
    active?: boolean
}) {
    return (
        <div className={`p-3 rounded-2xl border transition-all duration-500 ${active ? 'bg-background border-primary shadow-lg' : 'bg-muted/30 border-muted-foreground/5'
            }`}>
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`h-3 w-3 ${color}`} />
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{label}</span>
            </div>
            <div className="flex items-baseline gap-0.5">
                <span className={`text-xl font-black tabular-nums ${color}`}>{value}</span>
                <span className="text-[10px] font-bold text-muted-foreground/60">{unit}</span>
            </div>
        </div>
    )
}
