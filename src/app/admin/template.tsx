"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1] // Custom ease for a premium feel
                }}
                className="flex-1 w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
