"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { motion } from "framer-motion"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(username, password)
      toast.success("Identity verified successfully!")
    } catch (error: any) {
      toast.error(error.message || "Unauthorized. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-8 md:p-12" onSubmit={handleSubmit}>
            <FieldGroup className="space-y-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Access Gateway</h1>
                <p className="text-slate-500 font-medium text-sm">
                  Initialize secure handshake to proceed.
                </p>
              </div>

              <Field className="space-y-2">
                <FieldLabel htmlFor="username" className="text-[10px] uppercase font-black tracking-widest text-slate-400">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="GATEWAY_USER"
                  className="h-12 bg-white/[0.03] border-white/5 focus-visible:border-red-600/50 focus-visible:ring-red-600/20 text-white rounded-xl placeholder:text-slate-600"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-slate-400">Password</FieldLabel>
                  <a href="#" className="text-[10px] uppercase font-black tracking-widest text-red-600 hover:text-red-500 transition-colors">Emergency Reset?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-12 bg-white/[0.03] border-white/5 focus-visible:border-red-600/50 focus-visible:ring-red-600/20 text-white rounded-xl placeholder:text-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_10px_30px_-5px_rgba(220,38,38,0.4)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : "Establish Connection"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <div className="relative hidden md:block bg-gradient-to-br from-red-950 to-black p-12 overflow-hidden">
            <div className="absolute inset-0 bg-red-600/[0.03] animate-pulse" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 shadow-xl shadow-red-600/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-4xl font-black text-white leading-tight">
                  THE FUTURE <br />
                  OF <span className="text-red-600 italic">SECURE</span> <br />
                  BROWSING.
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-1 w-8 bg-red-600/30 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ x: [-32, 32] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      className="h-full w-4 bg-red-600"
                    />
                  </div>)}
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Encrypted Protocol Version 4.1.0-RC
                </p>
              </div>
            </div>

            {/* Ambient Shield background */}
            <div className="absolute -bottom-20 -right-20 opacity-10">
              <svg width="400" height="400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#dc2626" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
        By initializing connection, you agree to the <a href="#" className="text-red-900 hover:text-red-600 transition-colors">Handshake Protocols</a> & <a href="#" className="text-red-900 hover:text-red-600 transition-colors">Privacy Shield</a>.
      </p>
    </div>
  )
}
