"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconShieldLock,
  IconChevronDown,
  IconArrowRight,
  IconShieldLock as IconShield,
  IconNetwork,
  IconServer2,
  IconIdBadge
} from "@tabler/icons-react"

// --- Interactive Network Background (Canvas) ---

const NetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    let particles: Particle[] = []
    const particleCount = Math.min(Math.floor((width * height) / 10000), 100)
    const connectionDistance = 150
    const mouse = { x: -1000, y: -1000 }

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2 + 1
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1

        // Mouse interaction (gentle repulsion)
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 150) {
          const force = (150 - distance) / 150
          this.x -= dx * force * 0.02
          this.y -= dy * force * 0.02
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(220, 38, 38, 0.3)"
        ctx.fill()
      }
    }

    const init = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        p1.update()
        p1.draw()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            const opacity = (1 - dist / connectionDistance) * 0.15
            ctx.strokeStyle = `rgba(220, 38, 38, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      requestAnimationFrame(animate)
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      init()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    init()
    animate()

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
    />
  )
}

// --- Components ---

const Shield3D = () => (
  <div className="relative group cursor-pointer">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative"
    >
      <div className="absolute inset-0 bg-red-600/20 rounded-full blur-[100px] group-hover:bg-red-500/30 transition-all duration-700 animate-pulse" />

      <svg width="320" height="360" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative filter drop-shadow-[0_25px_50px_rgba(220,38,38,0.5)]">
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
          <mask id="shieldMask">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="white" />
          </mask>
        </defs>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#shieldGrad)" />
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#dc2626" strokeWidth="0.5" strokeOpacity="0.5" />

        <g mask="url(#shieldMask)">
          <motion.path
            initial={{ opacity: 0.1, y: -20 }}
            animate={{ opacity: [0.1, 0.4, 0.1], y: 20 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            d="M0 4H24M0 8H24M0 12H24M0 16H24M0 20H24"
            stroke="white"
            strokeWidth="0.1"
          />
          <circle cx="12" cy="11" r="4" stroke="white" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.3" />
          <path d="M12 8v6M9 11h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </motion.div>
  </div>
)

const DiamondFeature = ({ icon: Icon, title, desc }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="group relative mb-20"
  >
    <div className="relative h-56 w-56 sm:h-64 sm:w-64 rotate-45 border border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-500 hover:border-red-600/50 hover:bg-white/[0.02] overflow-hidden flex items-center justify-center">
      <div className="-rotate-45 text-center px-4 sm:px-6">
        <div className="mb-4 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-red-600/10 text-red-500 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <h3 className="mb-2 text-md sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors uppercase tracking-wider">{title}</h3>
        <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-medium">{desc}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-red-600/5 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </motion.div>
)

const DeploymentCard = ({ number, title, desc }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="w-full max-w-4xl mx-auto p-10 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-2xl group hover:border-red-600/30 transition-all duration-500 mb-8"
  >
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="text-red-600 text-6xl font-black opacity-30 group-hover:opacity-100 transition-opacity italic">
        {number}
      </div>
      <div className="flex-1 text-center md:text-left">
        <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-widest">{title}</h4>
        <p className="text-lg text-slate-500 font-medium leading-relaxed italic">{desc}</p>
      </div>
    </div>
    <div className="mt-8 h-px w-0 bg-gradient-to-r from-red-600/50 to-transparent group-hover:w-full transition-all duration-700" />
  </motion.div>
)

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/5 last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left group"
      >
        <span className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
          {question}
        </span>
        <IconChevronDown className={`h-5 w-5 text-red-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="pb-6 text-slate-400 leading-relaxed font-medium italic">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Main Component ---

export default function Home() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { scrollYProgress } = useScroll()

  // Parallax floating effect for sections
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -50])

  const handleCTA = () => {
    if (user) {
      router.push(isAdmin ? "/admin/dashboard" : "/dashboard")
    } else {
      router.push("/login")
    }
  }

  const whitepaperUrl = "https://share.google/tukaBBAvKsQUQsjFw"

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30 selection:text-red-500 overflow-x-hidden relative">

      {/* Persistent Animated Network Background */}
      <NetworkBackground />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-transform">
              <IconShieldLock className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">
              Wireguard<span className="text-red-500">Gateway</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {["Home", "Features", "Monitoring", "Login"].map((item) => {
              const href = item === "Login" ? "/login" : item === "Monitoring" ? "/dashboard/monitoring" : `#${item.toLowerCase()}`;
              return (
                <a key={item} href={href} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 transition-colors">
                  {item}
                </a>
              )
            })}
          </div>

          <Button
            onClick={handleCTA}
            variant="outline"
            className="rounded-xl border-white/10 bg-white/[0.02] px-8 font-black uppercase tracking-widest text-white hover:bg-red-600 hover:border-red-600 transition-all duration-500"
          >
            Portal Access
          </Button>
        </div>
      </nav>

      {/* Content Layer */}
      <motion.div style={{ y: yParallax }} className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="relative pt-48 pb-32 px-6 overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:w-3/5 text-center lg:text-left"
              >
                <Badge className="mb-8 bg-red-950/30 text-red-500 border-red-900/50 px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-[0.3em]">
                  B2B Network Security Solution
                </Badge>
                <h1 className="mb-8 text-6xl font-black leading-[1.1] tracking-tighter md:text-8xl">
                  Enterprise-Grade <br />
                  <span className="bg-gradient-to-r from-red-600 to-red-900 bg-clip-text text-transparent italic">VPN Gateway.</span>
                </h1>
                <p className="mb-12 max-w-2xl text-xl font-medium text-slate-400 leading-relaxed mx-auto lg:mx-0">
                  Simplified Security for your Infrastructure. Deploy a robust, high-performance Wireguard network
                  bridging distributed environments with zero-trust architectural integrity.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                  <Button
                    onClick={handleCTA}
                    className="h-16 rounded-xl bg-red-600 px-12 font-black uppercase tracking-widest text-white shadow-[0_20px_40px_-10px_rgba(220,38,38,0.4)] transition-all hover:bg-red-500 hover:translate-y-[-2px] active:translate-y-[0px]"
                  >
                    Get Started
                    <IconArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                    className="h-16 rounded-xl border border-white/5 px-12 font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/[0.03] transition-all"
                  >
                    <a href={whitepaperUrl} target="_blank" rel="noopener noreferrer">Whitepaper</a>
                  </Button>
                </div>
              </motion.div>

              <div className="lg:w-2/5 flex justify-center lg:justify-end">
                <Shield3D />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section (Diamond Grid) */}
        <section id="features" className="relative py-40 px-6 overflow-hidden border-y border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-32 relative z-50">
              <h2 className="text-4xl font-black uppercase tracking-[0.4em] text-white mb-6">Infrastructure Core</h2>
              <p className="text-red-700 font-black tracking-widest uppercase text-xs italic">Designed for Scalability & Reliability</p>
            </div>

            <div className="flex flex-wrap justify-center gap-24 sm:gap-32 md:gap-40 lg:gap-48 px-10">
              <DiamondFeature
                icon={IconShield}
                title="Modern Crypto"
                desc="Noise protocol framework providing authenticated encryption and perfect forward secrecy."
              />
              <DiamondFeature
                icon={IconNetwork}
                title="Mesh Topology"
                desc="Seamlessly connect distributed cloud VPCs and on-premise data centers."
              />
              <DiamondFeature
                icon={IconServer2}
                title="LDAP Native"
                desc="Enterprise-grade directory integration for centralized user and role management."
              />
              <DiamondFeature
                icon={IconIdBadge}
                title="Access Control"
                desc="Granular device revocation and policy enforcement at the gateway level."
              />
            </div>
          </div>
        </section>

        {/* Security Architecture (Deployment Process) */}
        <section className="relative py-40 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-24 relative z-50">
              <h2 className="text-5xl font-black mb-6 uppercase tracking-tight italic text-white">
                Streamlined <span className="text-red-600">Deployment</span> Process
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Rapid Integration & Zero-Trust Onboarding</p>
            </div>

            <div className="flex flex-col gap-12">
              {[
                { number: "01", title: "Generate Config", desc: "Automated profile generation with unique cryptographic key pairs for every endpoint." },
                { number: "02", title: "Distribute Key", desc: "Secure delivery of configurations via encrypted channels to authorized devices." },
                { number: "03", title: "Encrypted Tunnel", desc: "Establish ultra-low latency UDP tunnels with kernel-level performance." }
              ].map((step, idx) => (
                <DeploymentCard key={idx} {...step} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="support" className="relative py-40 px-6 border-t border-white/5">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-24 relative z-50">
              <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter text-white">Frequently <span className="text-red-600">Asked</span> Questions</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Technical Inquiries & Compliance Guidelines</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.01] px-10 h-auto min-h-[300px] backdrop-blur-md relative z-20">
              <FAQItem
                question="How does Wireguard integrate with existing LDAP/Active Directory?"
                answer="Our gateway features a native LDAP connector that maps directory groups to VPN access policies. Authentication is performed in real-time against your primary identity provider, ensuring immediate access revocation when a user is disabled in AD."
              />
              <FAQItem
                question="Is there support for site-to-site VPN tunnels?"
                answer="Yes. The architecture supports both point-to-site (remote access) and site-to-site configurations. You can establish persistent encrypted links between distributed data centers and branch offices using optimized routing protocols."
              />
              <FAQItem
                question="How do we manage centralized device revocation for employees?"
                answer="Administrators have access to a centralized dashboard to monitor all active peer connections. A single click can revoke a compromised device's public key, immediately dropping its tunnel and clearing its routing entry from the gateway kernel."
              />
              <FAQItem
                question="What is the performance overhead compared to IPSec/OpenVPN?"
                answer="Wireguard is implemented in the Linux kernel space and utilizes a state-of-the-art crypto suite. It typically delivers 3x-4x higher throughput compared to OpenVPN with significantly lower CPU utilization, making it ideal for high-bandwidth corporate environments."
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative pt-32 pb-16 px-6 border-t border-white/5 z-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
              <div>
                <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => router.push('/')}>
                  <IconShieldLock className="h-6 w-6 text-red-600" />
                  <span className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">
                    Wireguard<span className="text-red-500">Gateway</span>
                  </span>
                </div>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  Enterprise-Grade Network Privacy
                </p>
              </div>

              <div className="flex flex-wrap gap-12 text-sm font-black uppercase tracking-widest text-slate-500">
                <a href={whitepaperUrl} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">Technical Whitepaper</a>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
                © 2026 Wireguard Gateway. All rights reserved.
              </p>
              <div className="flex items-center gap-2 group cursor-default ml-auto md:ml-0">
                <span className="text-[10px] uppercase font-bold text-slate-700">Refined by</span>
                <span className="text-xs font-black bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent tracking-widest uppercase">
                  Adenita
                </span>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  )
}
