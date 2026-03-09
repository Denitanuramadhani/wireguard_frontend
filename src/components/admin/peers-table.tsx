"use client"

import { useState } from "react"
import {
    Copy,
    Check,
    ArrowUpRight,
    ArrowDownRight,
    Globe,
    Clock,
    Key,
    Smartphone,
    Zap
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { EmptyState } from "@/components/ui/empty-state"

interface Peer {
    public_key: string
    device_name: string
    vpn_ip: string
    last_handshake: string
    transfer_rx: number
    transfer_tx: number
    endpoint: string
}

export function PeersTable({ peers, loading }: { peers: Peer[], loading: boolean }) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key)
        setCopiedKey(key)
        toast.success("Public key copied")
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatTimeAgo = (dateStr: string) => {
        if (!dateStr || dateStr.startsWith('0001')) return 'Never'
        const date = new Date(dateStr)
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diff < 60) return `${diff}s ago`
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
        return date.toLocaleDateString()
    }

    return (
        <Card className="border-muted-foreground/10 shadow-xl overflow-hidden rounded-xl bg-background/50 backdrop-blur-sm">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="px-6 py-4 font-semibold">Peer Key</TableHead>
                                <TableHead className="font-semibold">Device</TableHead>
                                <TableHead className="font-semibold">VPN IP</TableHead>
                                <TableHead className="font-semibold text-center">Connection</TableHead>
                                <TableHead className="font-semibold">Transfer (Up/Down)</TableHead>
                                <TableHead className="px-6 font-semibold">Endpoint</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6} className="h-20 animate-pulse bg-muted/10 px-6" />
                                    </TableRow>
                                ))
                            ) : peers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-0 border-0">
                                        <EmptyState
                                            icon={Zap}
                                            title="No active peers connected"
                                            description="No real-time encrypted data flow detected. New peers will appear here once they establish a secure handshake."
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                peers.map((peer, index) => {
                                    const lastHandshake = new Date(peer.last_handshake).getTime()
                                    const isActive = (Date.now() - lastHandshake) < (300 * 1000) && peer.last_handshake && !peer.last_handshake.startsWith('0001')

                                    return (
                                        <TableRow key={index} className="hover:bg-muted/20 transition-colors group">
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Key className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                        {peer.public_key}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleCopy(peer.public_key)}
                                                    >
                                                        {copiedKey === peer.public_key ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex h-2 w-2">
                                                        {isActive && (
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        )}
                                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-400'}`}></span>
                                                    </div>
                                                    <Smartphone className="h-4 w-4 text-primary" />
                                                    <span className="font-semibold">{peer.device_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{peer.vpn_ip}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col items-center gap-1">
                                                    <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""}>
                                                        {isActive ? "Active Now" : "Inactive"}
                                                    </Badge>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTimeAgo(peer.last_handshake)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                                        <ArrowUpRight className="h-3 w-3" />
                                                        <span>{formatBytes(peer.transfer_tx)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                                                        <ArrowDownRight className="h-3 w-3" />
                                                        <span>{formatBytes(peer.transfer_rx)}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6">
                                                <Badge variant="outline" className="font-mono text-[10px] bg-muted/50 border-muted-foreground/10 py-1">
                                                    <Globe className="mr-1.5 h-3 w-3 opacity-50" />
                                                    {peer.endpoint !== '(none)' ? peer.endpoint : 'No endpoint'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
