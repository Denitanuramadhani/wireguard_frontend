"use client"

import { LoginForm } from "@/components/login-form"
import { motion } from "framer-motion"
import { IconShieldLock } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-1/4 h-[800px] w-[800px] bg-red-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 -right-1/4 h-[600px] w-[600px] bg-red-800/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm md:max-w-4xl"
      >
        <div className="flex items-center gap-2 mb-8 justify-center group cursor-pointer" onClick={() => router.push('/')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-transform">
            <IconShieldLock className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-white">
            Wireguard<span className="text-red-500">Gateway</span>
          </span>
        </div>

        <LoginForm />
      </motion.div>

      <div className="mt-8 text-center relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
          © 2026 Wireguard Gateway. Designed by <span className="text-red-600">Adenita</span>
        </p>
      </div>
    </div>
  )
}
