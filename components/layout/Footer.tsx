import Link from "next/link";
import { Logo } from "./Logo";
import { business } from "@/lib/site";
import { CopyrightYear } from "./CopyrightYear";
import { ChromaticFooter } from "@/components/ChromaticFooter";
import { ArrowButton } from "@/components/ArrowButton";
import { QuoteLink } from "@/components/ui/QuoteLink";
import { MailIcon, PhoneIcon } from "@/components/ui/Icons";

// Each links to the quote form with that service already chosen.
const services = [
  { label: "Irrigation Repair", service: "Irrigation Repair" },
  { label: "Irrigation Installation", service: "Irrigation Installation" },
  { label: "Sprinkler Optimization", service: "Sprinkler System Repair & Optimization" },
  { label: "Lawn Care", service: "Lawn Care" },
  { label: "Palm Tree Care", service: "Palm Tree Care" },
  { label: "Outdoor Lighting", service: "Professional Outdoor Lighting" },
];

export function Footer() {
  return (
    <ChromaticFooter className="bg-[#0d150f] text-white/80">
      <div className="container-x py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo size={64} tone="light" />
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-white/65">
              Irrigation, lawn care and landscape services for Champions Gate, Celebration, Haines City, Davenport, Four
              Corners, FL and surrounding areas. Over {business.yearsInIndustry} years in the green industry.
            </p>
            <p className="mt-5 text-sm text-white/55">
              Fully licensed &amp; insured · License {business.license}
              <br />
              Official Grounds Guys Partner
            </p>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-sand">Services</h2>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              {services.map((s) => (
                <li key={s.label}>
                  <QuoteLink service={s.service} className="nav-link hover:text-white">
                    {s.label}
                  </QuoteLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-sand">Get in touch</h2>
            <p className="mt-5 max-w-md font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold leading-tight tracking-[-0.04em] text-white">
              Ready to stop wasting water?
            </p>
            <div className="mt-6">
              <ArrowButton href="/#quote" light>
                Get a Free Quote
              </ArrowButton>
            </div>
            <ul className="mt-8 space-y-3 text-[0.95rem]">
              <li>
                <a href={business.phoneHref} className="inline-flex items-center gap-2 hover:text-white">
                  <PhoneIcon className="h-4 w-4 text-sand" />
                  <span className="nav-link">{business.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="inline-flex min-w-0 items-center gap-2 [overflow-wrap:anywhere] hover:text-white">
                  <MailIcon className="h-4 w-4 shrink-0 text-sand" />
                  <span className="nav-link">{business.email}</span>
                </a>
              </li>
            </ul>
            <dl className="mt-6 grid max-w-sm gap-1.5 text-sm">
              {business.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <dt className="text-white/55">{h.days}</dt>
                  <dd className="text-right">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © <CopyrightYear /> {business.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy" className="nav-link hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="nav-link hover:text-white">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </ChromaticFooter>
  );
}
