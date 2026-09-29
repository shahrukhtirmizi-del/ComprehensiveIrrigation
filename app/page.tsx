import IntroPreloader from "@/components/IntroPreloader";
import ScrollExpandHero from "@/components/ScrollExpandHero";
import { ArrowButton } from "@/components/ArrowButton";
import { PhoneIcon } from "@/components/ui/Icons";
import { business } from "@/lib/site";
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
      {/* Intro: split-curtain typography preloader, played over the page, fading onto the hero below. */}
      <IntroPreloader />
      {/* 1: the actual hero — scroll expands the photo, then the copy and CTAs land on it. */}
      <ScrollExpandHero>
        <div className="container-x pb-12 md:pb-16">
          <div className="max-w-2xl text-white">
            <p className="eyebrow !text-sand">Davenport · Champions Gate · Celebration · Haines City</p>
            <p className="mt-4 font-display text-[clamp(1.9rem,4vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.045em]">
              Healthier lawns. Smarter irrigation. No wasted water.
            </p>
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-white/80">
              Licensed &amp; insured irrigation repair, sprinkler maintenance and lawn care — over{" "}
              {business.yearsInIndustry} years keeping Central Florida lawns green.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ArrowButton href="/#quote" light>
                Get a Free Quote
              </ArrowButton>
              <a href={business.phoneHref} className="inline-flex items-center gap-2 text-sm font-bold text-white">
                <PhoneIcon className="h-4 w-4" />
                <span className="nav-link">{business.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </ScrollExpandHero>
      {/* 2: straight into the gallery reveal — nothing in between. */}
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
