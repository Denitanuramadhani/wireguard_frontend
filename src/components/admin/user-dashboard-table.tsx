"use client"

import { Power, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const mockUsers = [
    {
        username: "Denitanuramadhani",
        vpnAccess: true,
        maxDevices: 5,
        activeDevices: 2,
    },
    {
        username: "Admin",
        vpnAccess: true,
        maxDevices: 10,
        activeDevices: 1,
    },
    {
        username: "User01",
        vpnAccess: false,
        maxDevices: 3,
        activeDevices: 0,
    },
    {
        username: "User02",
        vpnAccess: true,
        maxDevices: 5,
        activeDevices: 3,
    },
]

export function UserDashboardTable() {
    return (
        <Card className="mx-4 lg:mx-6 border-muted-foreground/10 shadow-xl overflow-hidden group/card transition-all duration-500 hover:shadow-primary/5 hover:border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold tracking-tight">User Management</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Username</TableHead>
                            <TableHead className="font-bold uppercase tracking-widest text-[10px]">VPN Access</TableHead>
                            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Max Devices</TableHead>
                            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Active Devices</TableHead>
                            <TableHead className="text-right px-6 font-bold uppercase tracking-widest text-[10px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockUsers.map((user) => (
                            <TableRow key={user.username} className="group/row hover:bg-muted/40 transition-all duration-300 ease-in-out border-b border-muted-foreground/5 last:border-0 hover:shadow-2xl hover:shadow-primary/5">
                                <TableCell className="font-bold px-6 py-4 transition-colors group-hover/row:text-primary tracking-tight">{user.username}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.vpnAccess ? "default" : "secondary"}
                                        className={user.vpnAccess
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover/row:bg-emerald-500/20 transition-all font-bold"
                                            : "font-bold"
                                        }
                                    >
                                        <div className={`h-1.5 w-1.5 rounded-full mr-2 ${user.vpnAccess ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" : "bg-slate-400"}`} />
                                        {user.vpnAccess ? "Enabled" : "Disabled"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs font-bold opacity-60 group-hover/row:opacity-100 transition-opacity">{user.maxDevices}</TableCell>
                                <TableCell className="font-mono text-xs font-bold opacity-60 group-hover/row:opacity-100 transition-opacity">{user.activeDevices}</TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant={user.vpnAccess ? "outline" : "default"}
                                            className={`flex gap-1.5 font-bold text-[10px] uppercase tracking-wider h-8 rounded-lg transition-all duration-300 ${user.vpnAccess
                                                ? "hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/5"
                                                : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                                }`}
                                        >
                                            <Power className="h-3.5 w-3.5" />
                                            {user.vpnAccess ? "Disable" : "Enable"}
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-110 active:scale-95">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 p-2 border-muted-foreground/10 shadow-2xl backdrop-blur-md">
                                                <DropdownMenuItem className="flex gap-2 cursor-pointer rounded-lg hover:bg-blue-500/10 hover:text-blue-600 transition-colors py-2.5">
                                                    <Edit2 className="h-4 w-4 text-blue-500" />
                                                    <span className="font-bold text-sm">Edit User</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="flex gap-2 text-red-500 cursor-pointer rounded-lg hover:bg-red-500/10 transition-colors py-2.5">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="font-bold text-sm">Delete Account</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
