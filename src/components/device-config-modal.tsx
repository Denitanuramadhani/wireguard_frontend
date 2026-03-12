"use client"

import { useState } from "react"
import {
    FileText,
    QrCode,
    Copy,
    Check,
    Download
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Device {
    device_id: number
    device_name: string
    vpn_ip: string
    config?: string
    qr_code?: string
}

interface DeviceConfigModalProps {
    device: Device | null
    isOpen: boolean
    onClose: (open: boolean) => void
    fetching: boolean
    onRegenerate?: (id: number) => Promise<any>
}

export function DeviceConfigModal({ device, isOpen, onClose, fetching, onRegenerate }: DeviceConfigModalProps) {
    const [copied, setCopied] = useState(false)

    const handleCopyConfig = () => {
        if (device?.config) {
            navigator.clipboard.writeText(device.config)
            setCopied(true)
            toast.success("Configuration copied to clipboard")
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownloadConfig = () => {
        if (device?.config) {
            const blob = new Blob([device.config], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${device.device_name}.conf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Device Configuration: {device?.device_name}</DialogTitle>
                    <DialogDescription>
                        Use the details below to connect your device to the WireGuard network.
                    </DialogDescription>
                </DialogHeader>

                {fetching ? (
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
                                    {device?.config || `[Interface]\nPrivateKey = <hidden>\nAddress = ${device?.vpn_ip}/32\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = <server-key>\nEndpoint = vpn.example.com:51820\nAllowedIPs = 0.0.0.0/0`}
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
                                {device?.qr_code ? (
                                    <img 
                                        src={`data:image/png;base64,${device.qr_code}`} 
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
                                    onClick={() => device && onRegenerate(device.device_id)}
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
    )
}
