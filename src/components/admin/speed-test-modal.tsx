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
    const [ping, setPing] = useState(0)
    const [jitter, setJitter] = useState(0)
    const [ip, setIp] = useState<string>("")
    const [phase, setPhase] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle')
    const [progress, setProgress] = useState(0)

    const workerRef = useRef<Worker | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const runTest = () => {
        if (workerRef.current) {
            workerRef.current.terminate()
        }

        setPhase('ping')
        setDownload(0)
        setUpload(0)
        setPing(0)
        setJitter(0)
        setIp("")
        setProgress(0)

        const worker = new Worker('/speedtest_worker.js')
        workerRef.current = worker

        const serverUrl = "http://librespeed.denita-nur.my.id/"

        worker.postMessage('start ' + JSON.stringify({
            test_order: "P_D_U",
            url_dl: serverUrl + "backend/garbage.php",
            url_ul: serverUrl + "backend/empty.php",
            url_ping: serverUrl + "backend/empty.php",
            url_getIp: serverUrl + "backend/getIP.php",
            telemetry_level: "disabled"
        }))

        timerRef.current = setInterval(() => {
            worker.postMessage('status')
        }, 100)

        worker.onmessage = (e) => {
            const data = JSON.parse(e.data)
            const state = data.testState

            if (state === 1) setPhase('download')
            else if (state === 2) setPhase('ping')
            else if (state === 3) setPhase('upload')
            else if (state === 4) {
                setPhase('complete')
                if (timerRef.current) clearInterval(timerRef.current)
                worker.terminate()
            } else if (state === 5) {
                setPhase('idle')
                if (timerRef.current) clearInterval(timerRef.current)
            }

            setDownload(parseFloat(data.dlStatus) || 0)
            setUpload(parseFloat(data.ulStatus) || 0)
            setPing(parseFloat(data.pingStatus) || 0)
            setJitter(parseFloat(data.jitterStatus) || 0)
            if (data.clientIp) setIp(data.clientIp)

            // Progress calculation
            let p = 0
            if (state === 2) p = data.pingProgress * 33
            else if (state === 1) p = 33 + data.dlProgress * 33
            else if (state === 3) p = 66 + data.ulProgress * 34
            else if (state === 4) p = 100
            setProgress(p)
        }
    }

    useEffect(() => {
        if (open) {
            runTest()
        } else {
            if (workerRef.current) workerRef.current.terminate()
            if (timerRef.current) clearInterval(timerRef.current)
        }
        return () => {
            if (workerRef.current) workerRef.current.terminate()
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [open])

    const currentSpeed = phase === 'upload' ? upload : download
    const maxSpeed = phase === 'upload' ? 500 : 1000 // Adjust based on expected speeds
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
                        <DialogDescription className="text-base text-balance">
                            Analyzing throughput from <span className="text-foreground font-semibold">Singapore SG-1</span> to {ip ? <span className="text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded border border-primary/20">{ip}</span> : "your local endpoint"}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex flex-col items-center justify-center pt-6 pb-10">
                    {/* Modern Gauge Container */}
                    <div className="relative h-64 w-80">
                        {/* Status Glow */}
                        <div className={`absolute inset-0 transition-opacity duration-1000 blur-[80px] rounded-full opacity-20 ${phase === 'download' ? 'bg-emerald-500' : phase === 'upload' ? 'bg-blue-500' : phase === 'ping' ? 'bg-amber-500' : 'bg-primary'
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
                                className={`transition-all duration-300 ease-out ${phase === 'download' ? 'text-emerald-500' : phase === 'upload' ? 'text-blue-500' : 'text-amber-500'
                                    }`}
                            />
                        </svg>

                        {/* Speed Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-7xl font-black tracking-tighter tabular-nums drop-shadow-sm">
                                    {phase === 'ping' ? ping : currentSpeed}
                                </span>
                                <span className="text-xl font-bold text-muted-foreground">{phase === 'ping' ? 'ms' : 'Mbps'}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-muted-foreground/10 mt-2">
                                {phase === 'upload' ? <ArrowUp className="h-3.5 w-3.5 text-blue-500" /> : phase === 'download' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-500" /> : <Activity className="h-3.5 w-3.5 text-amber-500" />}
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {phase === 'upload' ? 'Testing Upload' : phase === 'download' ? 'Testing Download' : phase === 'ping' ? 'Testing Latency' : 'Scan Complete'}
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
                        <MetricCard
                            icon={SignalHigh}
                            label="Latency"
                            value={ping}
                            unit="ms"
                            color={phase === 'ping' ? 'text-amber-500' : 'text-muted-foreground'}
                            active={phase === 'ping'}
                        />
                        <MetricCard
                            icon={Zap}
                            label="Jitter"
                            value={jitter}
                            unit="ms"
                            color="text-muted-foreground"
                        />
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
