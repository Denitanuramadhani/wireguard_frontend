"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
    Search,
    Users,
    Monitor,
    Activity,
    Zap,
    Moon,
    Sun,
    LayoutDashboard,
    Command as CommandIcon
} from "lucide-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const { setTheme } = useTheme()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = (command: () => void) => {
        setOpen(false)
        command()
    }

    return (
        <>
            <div className="hidden lg:flex items-center">
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 hover:bg-muted border border-muted-foreground/20 rounded-lg transition-all"
                >
                    <CommandIcon className="h-3 w-3" />
                    <span>Search Console...</span>
                    <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </button>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => runCommand(() => router.push("/admin/dashboard"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Go to Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/admin/users"))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Go to Users</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/admin/devices"))}>
                            <Monitor className="mr-2 h-4 w-4" />
                            <span>Go to Devices</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/admin/peers"))}>
                            <Activity className="mr-2 h-4 w-4" />
                            <span>Go to Peers</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/admin/bandwidth"))}>
                            <Zap className="mr-2 h-4 w-4" />
                            <span>Go to Bandwidth</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Theme">
                        <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Switch to Light Mode</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Switch to Dark Mode</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
