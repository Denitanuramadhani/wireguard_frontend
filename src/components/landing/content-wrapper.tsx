import { LandingHeader } from "./header";
import { HeroSection } from "./hero-section";

export function ContentWrapper() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LandingHeader />
      <HeroSection />
    </div>
  );
}

