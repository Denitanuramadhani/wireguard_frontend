"use client"

import { useState } from "react"
import {
    MoreVertical,
    Trash2,
    FileText,
    QrCode,
    Search,
    Plus,
    Copy,
    Check,
    Download,
    Smartphone,
    Monitor
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { EmptyState } from "@/components/ui/empty-state"

interface Device {
    device_id: number
    device_name: string
    vpn_ip: string
    ldap_uid: string
    status: string
    created_at: string
    config?: string
    qr_code?: string
}

export function DeviceTable({ 
    devices, 
    loading, 
    onRevoke, 
    onRegenerate,
    onViewConfig 
}: { 
    devices: Device[], 
    loading: boolean, 
    onRevoke: (id: number) => void,
    onRegenerate?: (id: number) => Promise<{ qr_code: string, config?: string } | undefined>,
    onViewConfig?: (id: number) => Promise<{ config: string, qr_code?: string }>
}) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
    const [configOpen, setConfigOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [fetchingConfig, setFetchingConfig] = useState(false)

    const filteredDevices = devices.filter(d =>
        d.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ldap_uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.vpn_ip.includes(searchQuery)
    )

    const handleCopyConfig = () => {
        if (selectedDevice?.config) {
            navigator.clipboard.writeText(selectedDevice.config)
            setCopied(true)
            toast.success("Configuration copied to clipboard")
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownloadConfig = () => {
        if (selectedDevice?.config) {
            const blob = new Blob([selectedDevice.config], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${selectedDevice.device_name}.conf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    }

    const handleOpenConfig = async (device: Device) => {
        setSelectedDevice(device)
        setConfigOpen(true)
        
        if (onViewConfig) {
            try {
                setFetchingConfig(true)
                const data = await onViewConfig(device.device_id)
                setSelectedDevice(prev => prev ? { ...prev, config: data.config, qr_code: data.qr_code } : null)
            } catch (error: any) {
                toast.error("Failed to fetch device configuration")
            } finally {
                setFetchingConfig(false)
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search devices..."
                        className="pl-10 h-10 bg-background/50 backdrop-blur-sm border-muted-foreground/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button className="h-10 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Device
                </Button>
            </div>

            <Card className="border-muted-foreground/10 shadow-xl overflow-hidden rounded-xl bg-background/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="px-6 py-4 font-semibold">ID User</TableHead>
                                    <TableHead className="font-semibold">Device Name</TableHead>
                                    <TableHead className="font-semibold">VPN IP</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Created</TableHead>
                                    <TableHead className="text-right px-6 font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6} className="h-16 animate-pulse bg-muted/10 px-6" />
                                        </TableRow>
                                    ))
                                ) : filteredDevices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="p-0 border-0">
                                            <EmptyState
                                                icon={Smartphone}
                                                title="No active devices found"
                                                description="Start by adding a new device to your private network to enable secure connectivity."
                                                action={
                                                    <Button className="bg-primary hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add New Device
                                                    </Button>
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDevices.map((device) => (
                                        <TableRow key={device.device_id} className="hover:bg-muted/30 transition-all duration-300 ease-in-out group/row border-b border-muted-foreground/5 last:border-0 hover:shadow-2xl hover:shadow-primary/5">
                                            <TableCell className="px-6 py-4 font-medium transition-colors group-hover/row:text-primary tracking-tight">@{device.ldap_uid}</TableCell>
                                            <TableCell className="font-semibold text-foreground/80 group-hover/row:text-foreground transition-colors">{device.device_name}</TableCell>
                                            <TableCell className="font-mono text-xs opacity-70 group-hover/row:opacity-100 transition-opacity">{device.vpn_ip}</TableCell>
                                            <TableCell>
                                                <Badge variant={device.status === 'active' ? 'default' : 'secondary'} className={
                                                    device.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover/row:bg-emerald-500/20 transition-all' : ''
                                                }>
                                                    <div className="relative mr-1.5 flex h-2 w-2">
                                                        {device.status === 'active' && (
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        )}
                                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${device.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-400'}`}></span>
                                                    </div>
                                                    {device.status === 'active' ? 'Online' : 'Offline'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm group-hover/row:text-foreground/60 transition-colors">
                                                {new Date(device.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/20 active:scale-95">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52 p-2 border-muted-foreground/10 shadow-2xl backdrop-blur-md">
                                                        <DropdownMenuItem onClick={() => handleOpenConfig(device)} className="gap-2 cursor-pointer rounded-lg hover:bg-blue-500/10 hover:text-blue-600 transition-colors">
                                                            <FileText className="h-4 w-4 text-blue-500" />
                                                            <span className="font-medium">View Config</span>
                                                        </DropdownMenuItem>
                                                        
                                                        {onRegenerate && (
                                                            <DropdownMenuItem onClick={() => onRegenerate(device.device_id)} className="gap-2 cursor-pointer rounded-lg hover:bg-amber-500/10 hover:text-amber-600 transition-colors">
                                                                <QrCode className="h-4 w-4 text-amber-500" />
                                                                <span className="font-medium">Regenerate QR</span>
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuItem onClick={() => onRevoke(device.device_id)} className="gap-2 text-destructive cursor-pointer rounded-lg hover:bg-red-500/10 transition-colors">
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="font-medium">Delete Device</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Config Modal */}
            <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Device Configuration: {selectedDevice?.device_name}</DialogTitle>
                        <DialogDescription>
                            Use the details below to connect your device to the WireGuard network.
                        </DialogDescription>
                    </DialogHeader>

                    {fetchingConfig ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground font-medium">Fetching secure configuration...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Configuration File</label>
                                <div className="relative group">
                                    <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-[10px] overflow-x-auto h-[300px] border border-slate-800">
                                        {selectedDevice?.config || `[Interface]\nPrivateKey = <hidden>\nAddress = ${selectedDevice?.vpn_ip}/32\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = <server-key>\nEndpoint = vpn.example.com:51820\nAllowedIPs = 0.0.0.0/0`}
                                    </pre>
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleCopyConfig}>
                                            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleDownloadConfig}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-4 border-l pl-6 border-muted-foreground/10">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest self-start">Mobile QR Code</label>
                                <div className="p-4 bg-white rounded-2xl shadow-inner border border-muted-foreground/10">
                                    {selectedDevice?.qr_code ? (
                                        <img 
                                            src={`data:image/png;base64,${selectedDevice.qr_code}`} 
                                            alt="QR Code" 
                                            className="h-52 w-52"
                                        />
                                    ) : (
                                        <div className="h-52 w-52 flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                                            <QrCode className="h-12 w-12 mb-2 opacity-20" />
                                            <p className="text-[10px] text-center px-4">QR Code not available. Please regenerate.</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-center text-muted-foreground px-6">
                                    Scan this code with the WireGuard mobile app to import configuration instantly.
                                </p>
                                {onRegenerate && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full mt-2 gap-2"
                                        onClick={async () => {
                                            if (selectedDevice && onRegenerate) {
                                                const data = await onRegenerate(selectedDevice.device_id);
                                                if (data) {
                                                    setSelectedDevice(prev => prev ? { 
                                                        ...prev, 
                                                        qr_code: data.qr_code,
                                                        config: data.config || prev.config
                                                    } : null);
                                                }
                                            }
                                        }}
                                    >
                                        <QrCode className="h-4 w-4" />
                                        Regenerate QR
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
