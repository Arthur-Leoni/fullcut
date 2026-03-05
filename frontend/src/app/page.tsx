import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Features />
      <BeforeAfter />
      <CTA />
      <Footer />
    </main>
  );
}
