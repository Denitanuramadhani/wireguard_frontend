"use client"

import { ReactNode } from "react"
import { LucideIcon, PackageOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description: string
    action?: ReactNode
    className?: string
}

export function EmptyState({
    icon: Icon = PackageOpen,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000",
            className
        )}>
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 transform -translate-y-4" />
                <div className="relative bg-background/50 backdrop-blur-sm border border-muted-foreground/10 p-6 rounded-3xl shadow-2xl">
                    <Icon className="h-12 w-12 text-muted-foreground/40" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-foreground/80 mb-2 truncate max-w-md">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
                {description}
            </p>
            {action && (
                <div className="animate-in fade-in slide-in-from-bottom-2 delay-300 duration-700">
                    {action}
                </div>
            )}
        </div>
    )
}
