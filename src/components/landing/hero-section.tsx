import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 lg:py-32">
      {/* Title - Center */}
      <h1 className="mb-6 text-center text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
        Streamline Your VPN Management
      </h1>

      {/* Subtitle - Center */}
      <p className="mb-12 max-w-2xl text-center text-lg leading-relaxed text-white/80 lg:text-xl">
        Innovating VPN management with scalable, user-friendly solutions. Drive
        efficiency, mitigate risk, and enhance user experiences for sustainable
        growth.
      </p>

      {/* CTA Buttons - Center */}
      <div className="mb-16 flex flex-col gap-4 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="group rounded-full bg-purple-600 px-8 text-white hover:bg-purple-700"
        >
          <Link href="/login">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-full border-white/20 bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white/20"
        >
          <Link href="/dashboard">Try Demo</Link>
        </Button>
      </div>

      {/* Dashboard Image - Center */}
      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-4xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
          <div className="relative rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm">
            <Image
              src="/dashboard_thumbnail.png"
              alt="WireGuard Dashboard Preview"
              width={1200}
              height={800}
              className="rounded-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

