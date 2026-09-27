import Link from "next/link";
import { Logo } from "./Logo";
import { business, navLinks } from "@/lib/site";
import { CopyrightYear } from "./CopyrightYear";
import { MailIcon, PhoneIcon } from "@/components/ui/Icons";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white/80">
      <div className="container-x py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <Logo size={64} tone="light" />
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-white/65">
              Irrigation, lawn care and landscape services for Champions Gate, Celebration, Haines City, Davenport,
              Four Corners, FL and surrounding areas.
            </p>
            <p className="mt-5 text-sm text-white/55">
              Fully licensed &amp; insured · License {business.license}
              <br />
              Official Grounds Guys Partner
            </p>
          </div>

          <div className="md:col-span-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-sand">Explore</h2>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="nav-link hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#quote" className="nav-link hover:text-white">
                  Free Quote
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-sand">Contact</h2>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
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
            <h2 className="mt-8 font-sans text-xs font-bold uppercase tracking-[0.18em] text-sand">We accept</h2>
            <p className="mt-3 text-sm text-white/65">{business.payments.join(" · ")}</p>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-sand">Hours</h2>
            <dl className="mt-5 space-y-2 text-[0.95rem]">
              {business.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 border-b border-white/10 pb-2">
                  <dt className="text-white/60">{h.days}</dt>
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
    </footer>
  );
}
