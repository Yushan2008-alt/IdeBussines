/**
 * RuangTeduh — Landing Page
 * Route: / (public)
 *
 * Sections:
 *  1. Navbar         — sticky, blur on scroll, mobile drawer
 *  2. HeroSection    — headline, phone mockup, floating cards, blob BG
 *  3. StatsSection   — animated counters, 3 key metrics
 *  4. FeaturesSection — 9 feature cards, staggered scroll anim
 *  5. HowItWorks     — 3 steps, SVG connector
 *  6. CrisisBanner   — real hotlines, expandable list
 *  7. TestimonialsSection — 4 anon quotes, mobile carousel
 *  8. CTASection     — final conversion CTA
 *  9. Footer         — links, emergency hotlines, legal
 */

import Navbar              from "@/components/landing/Navbar";
import HeroSection         from "@/components/landing/HeroSection";
import StatsSection        from "@/components/landing/StatsSection";
import FeaturesSection     from "@/components/landing/FeaturesSection";
import HowItWorks          from "@/components/landing/HowItWorks";
import CrisisBanner        from "@/components/landing/CrisisBanner";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection          from "@/components/landing/CTASection";
import Footer              from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-cream overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorks />
      <CrisisBanner />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
