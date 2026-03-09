"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

// 3D Cartoon Sun SVG - High Definition Stylized
const Sun3D = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="sunOuter" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#FFF7ED" />
                <stop offset="60%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#EA580C" />
            </radialGradient>
            <filter id="sunShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                <feOffset dx="1" dy="1" result="offsetblur" />
                <feFlood floodColor="#EA580C" floodOpacity="0.4" />
                <feComposite in2="offsetblur" operator="in" />
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        {/* Sun Rays - Cartoonish rounded rects */}
        <g filter="url(#sunShadow)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <rect
                    key={angle}
                    x="11"
                    y="0"
                    width="2"
                    height="5"
                    rx="1"
                    fill="#F59E0B"
                    transform={`rotate(${angle} 12 12)`}
                />
            ))}
        </g>
        {/* Sun Body with a mock 3D highlight */}
        <circle cx="12" cy="12" r="6.5" fill="url(#sunOuter)" filter="url(#sunShadow)" />
        <circle cx="10" cy="10" r="2" fill="white" fillOpacity="0.4" />
    </svg>
)

// 3D Cartoon Moon SVG - Soft Textured Crescent
const Moon3D = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="moonBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F0F9FF" />
                <stop offset="100%" stopColor="#7DD3FC" />
            </linearGradient>
            <filter id="moonDepth">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
                <feOffset dx="-0.5" dy="-0.5" result="offset" />
                <feComposite in="SourceGraphic" in2="offset" operator="over" />
            </filter>
        </defs>
        <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            fill="url(#moonBody)"
            stroke="#7DD3FC"
            strokeWidth="0.5"
            filter="url(#moonDepth)"
        />
        {/* Craters - soft textured circles */}
        <circle cx="13" cy="15" r="1.5" fill="#0EA5E9" fillOpacity="0.25" />
        <circle cx="17" cy="11" r="1.2" fill="#0EA5E9" fillOpacity="0.2" />
        <circle cx="10" cy="8" r="0.8" fill="#0EA5E9" fillOpacity="0.3" />
    </svg>
)

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="w-10 h-10" />

    const isDark = theme === "dark"

    const toggleTheme = (e: React.MouseEvent) => {
        if (isAnimating) return

        const rect = buttonRef.current?.getBoundingClientRect()
        if (rect) {
            setRipplePos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            })
        }

        setIsAnimating(true)

        // Switch theme exactly when ripple covers significant portion
        setTimeout(() => {
            setTheme(isDark ? "light" : "dark")
        }, 500)

        // Clear animation state after completion
        setTimeout(() => {
            setIsAnimating(false)
        }, 1200)
    }

    return (
        <>
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                className="group relative z-[101] h-10 w-10 rounded-xl bg-slate-50/50 backdrop-blur-xl border border-slate-200/50 shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800/50 transition-all hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-90"
                onClick={toggleTheme}
            >
                <AnimatePresence mode="wait">
                    {!isDark ? (
                        <motion.div
                            key="sun"
                            initial={{ y: 30, opacity: 0, scale: 0.3, rotate: -90 }}
                            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ y: -30, opacity: 0, scale: 0.3, rotate: 90 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 18,
                                mass: 1.2
                            }}
                            className="relative flex items-center justify-center"
                        >
                            <Sun3D />
                            {/* Sun Flare Effect on Toggle */}
                            {isAnimating && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: [1, 3.5, 0], opacity: [0, 0.6, 0] }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute inset-x-[-20px] inset-y-[-20px] bg-orange-400/20 rounded-full blur-2xl"
                                />
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="moon"
                            initial={{ y: 30, opacity: 0, scale: 0.3, rotate: 90 }}
                            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ y: -30, opacity: 0, scale: 0.3, rotate: -90 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 18,
                                mass: 1.2
                            }}
                            className="relative flex items-center justify-center"
                        >
                            <Moon3D />
                            {/* Moon Sparkle Effect */}
                            {isAnimating && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [1, 3, 0], opacity: [0, 0.5, 0] }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="absolute inset-x-[-15px] inset-y-[-15px] bg-blue-400/10 rounded-full blur-xl"
                                    />
                                    {[...Array(4)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: (i % 2 ? 1 : -1) * 12, y: (i < 2 ? 1 : -1) * 12 }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
                                        />
                                    ))}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Spectacular Ripple Overlay */}
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        initial={{
                            clipPath: `circle(0% at ${ripplePos.x}px ${ripplePos.y}px)`,
                        }}
                        animate={{
                            clipPath: `circle(150% at ${ripplePos.x}px ${ripplePos.y}px)`,
                        }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.4 }
                        }}
                        transition={{ duration: 0.9, ease: [0.7, 0, 0.3, 1] }}
                        className={`fixed inset-0 z-[100] pointer-events-none ${!isDark ? 'bg-zinc-950' : 'bg-slate-50'
                            }`}
                    />
                )}
            </AnimatePresence>
        </>
    )
}
