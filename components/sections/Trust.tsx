import Image from "next/image";
import { business } from "@/lib/site";
import { CheckIcon, ShieldIcon, LeafIcon } from "@/components/ui/Icons";

export function Trust() {
  return (
    <section aria-labelledby="trust-title" className="p-2 md:p-3">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] md:rounded-[2.25rem]">
        <Image
          src="/images/landscape-lighting-dusk.jpg"
          alt="Palm-lined Florida home with warm landscape lighting at dusk"
          fill
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal/92 via-charcoal/75 to-charcoal/30" />

        <div className="container-x py-24 md:py-36">
          <div className="max-w-2xl text-white">
            <p className="eyebrow !text-sand" data-reveal>
              Why Comprehensive
            </p>
            <h2 id="trust-title" data-split className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.06]">
              Over 25 years in the green industry, fully licensed and insured. We help you save water and save money,{" "}
              <em className="italic text-sand-soft">guaranteed.</em>
            </h2>
            <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-white/70" data-reveal>
              Florida license {business.license}. Payment by {business.payments.slice(0, 4).join(", ")}, check or cash.
            </p>
          </div>

          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" data-stagger="0.16" aria-label="Partnerships and verifications">
            <li className="flex items-center gap-3 rounded-[1.25rem] bg-white p-4 text-charcoal shadow-[var(--shadow-lift)] sm:col-span-2 lg:col-span-1">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest text-white">
                <LeafIcon className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-stone">Official</span>
                <span className="block font-display text-[1.05rem]">Grounds Guys Partner</span>
              </span>
            </li>
            {business.verifications.map((v) => (
              <li
                key={v}
                className="flex items-center gap-3 rounded-[1.25rem] bg-white/10 p-4 text-white ring-1 ring-white/15 backdrop-blur-md"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
                  <CheckIcon className="h-5 w-5 text-sand" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white/60">Verified on</span>
                  <span className="block font-display text-[1.05rem]">{v}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/60" data-reveal>
            <ShieldIcon className="h-4 w-4 text-sand" /> Fully licensed &amp; insured
          </p>
        </div>
      </div>
    </section>
  );
}
