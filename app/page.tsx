import { Hero } from "@/components/sections/Hero";
import { WaterCallout } from "@/components/sections/WaterCallout";
import { Services } from "@/components/sections/Services";
import { MaintenanceProgram } from "@/components/sections/MaintenanceProgram";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Trust } from "@/components/sections/Trust";
import { Testimonials } from "@/components/sections/Testimonials";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <WaterCallout />
      <Services />
      <MaintenanceProgram />
      <BeforeAfter />
      <Trust />
      <Testimonials />
      <ServiceArea />
      <QuoteForm />
      <FinalCta />
    </>
  );
}
