import SplitRevealHero from "@/components/SplitRevealHero";
import CinematicGalleryReveal from "@/components/CinematicGalleryReveal";
import ServiceScrollCards from "@/components/ServiceScrollCards";
import OurWorkGallery from "@/components/OurWorkGallery";
import { BrandStatement } from "@/components/sections/BrandStatement";
import { RevealText } from "@/components/RevealText";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { MaintenanceProgram } from "@/components/sections/MaintenanceProgram";
import Testimonials from "@/components/Testimonials";
import TrustWordWheel from "@/components/TrustWordWheel";

// The whole site shares one Lenis instance (components/providers/SmoothScroll, mounted in app/layout.tsx),
// wired to ScrollTrigger and the GSAP ticker. The footer (ChromaticFooter) is also mounted by the layout.
export default function Home() {
  return (
    <>
      {/* 1–2: the hero hands straight off to the gallery reveal — nothing in between. */}
      <SplitRevealHero />
      <CinematicGalleryReveal embedded={false} />
      {/* 3 */}
      <ServiceScrollCards />
      {/* Photo gallery + lightbox (#work) — kept: nav, "See Our Work" and the button audit all point at it. */}
      <OurWorkGallery />
      {/* 4: Protect Your Lawn */}
      <BrandStatement />
      {/* 5 */}
      <RevealText />
      {/* Quote form (#quote) — kept: every "Get a Free Quote" CTA on the site lands here. */}
      <QuoteForm />
      {/* 6: Comprehensive Preferred Program */}
      <MaintenanceProgram />
      {/* 7 */}
      <Testimonials />
      {/* 8 */}
      <TrustWordWheel />
    </>
  );
}
