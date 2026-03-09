"use client"

import { Bell, Hand } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface WelcomeHeaderProps {
    username?: string
    alertCount?: number
}

export function WelcomeHeader({ username, alertCount = 0 }: WelcomeHeaderProps) {
    return (
        <div className="flex flex-col gap-1 px-4 lg:px-6">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome <span className="text-primary">{username || 'Admin'}</span>, are you ready?
                </h1>
                <Hand className="h-6 w-6 text-yellow-500 animate-bounce" />
                <div className="ml-auto">
                    {alertCount > 0 && (
                        <Badge variant="destructive" className="flex items-center gap-1 px-2 py-1">
                            <Bell className="h-4 w-4" />
                            <span>{alertCount} New Alerts</span>
                        </Badge>
                    )}
                </div>
            </div>
            <p className="text-muted-foreground">
                Overview of your network performance today.
            </p>
        </div>
    )
}
