import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-4">
      <div className="rounded-full border border-white/10 bg-black/40 px-6 py-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <span className="text-lg font-bold text-white">W</span>
            </div>
            <span className="text-xl font-semibold text-white">WireGuard</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              About Us
            </Link>
            <Link
              href="#integration"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              Integration
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              Contact
            </Link>
          </nav>

          {/* Register Button */}
          <Button
            asChild
            className="rounded-full bg-purple-600 px-6 text-white hover:bg-purple-700"
          >
            <Link href="/login">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

