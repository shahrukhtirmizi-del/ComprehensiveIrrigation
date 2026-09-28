import { Hero } from "@/components/sections/Hero";
import AboutSection from "@/components/sections/AboutSection";
import { Services } from "@/components/sections/Services";
import { WaterCallout } from "@/components/sections/WaterCallout";
import { MaintenanceProgram } from "@/components/sections/MaintenanceProgram";
import OurWorkGallery from "@/components/OurWorkGallery";
import { BrandStatement } from "@/components/sections/BrandStatement";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Trust } from "@/components/sections/Trust";
import Testimonials from "@/components/sections/Testimonials";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <Services />
      <WaterCallout />
      <MaintenanceProgram />
      <OurWorkGallery />
      <BrandStatement />
      <BeforeAfter />
      <Trust />
      <Testimonials />
      <ServiceArea />
      <QuoteForm />
      <FinalCta />
    </>
  );
}
