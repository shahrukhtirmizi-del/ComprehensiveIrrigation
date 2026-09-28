import { RevealText } from "@/components/ui/RevealText";
import { CheckIcon, LeafIcon } from "@/components/ui/Icons";
import { business } from "@/lib/site";

// Reuses the site's own gallery photography — no outside stock.
const letterImages = [
  "/images/work-mulch-bed-croton.jpg",
  "/images/work-grass-dew-macro.jpg",
  "/images/work-pool-backyard-sunset.jpg",
  "/images/work-technician-sprinkler-head.jpg",
  "/images/work-sprinkler-spray-closeup.jpg",
  "/images/work-sunny-front-yard.jpg",
];

/** Mission statement: one word that fills with our work on hover, plus the partnership and verification marks. */
export function Mission() {
  return (
    <section aria-labelledby="mission-title" className="p-2 md:p-3">
      <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden rounded-[1.75rem] bg-charcoal px-4 py-24 text-center md:rounded-[2.25rem]">
        <p className="eyebrow !text-sand">Our mission</p>
        <h2 id="mission-title" className="sr-only">
          Our mission: help Central Florida landscapes thrive without wasting water
        </h2>

        <div className="mt-6">
          <RevealText text="Thrive" textColor="text-cream" overlayColor="text-brand" letterImages={letterImages} />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-white/70 md:text-lg">
          Over 25 years in the green industry, fully licensed and insured. We help you save water and save money,
          guaranteed. <span className="hidden text-white/45 md:inline">Hover a letter to see the work.</span>
        </p>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-2.5" aria-label="Partnerships and verifications" data-stagger="0.12">
          <li className="flex items-center gap-2.5 rounded-full bg-white py-2 pl-2 pr-4 text-charcoal shadow-[var(--shadow-lift)]">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-white">
              <LeafIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold">Official Grounds Guys Partner</span>
          </li>
          {business.verifications.map((v) => (
            <li key={v} className="flex items-center gap-2 rounded-full bg-white/10 py-2 pl-2.5 pr-4 text-white ring-1 ring-white/15">
              <CheckIcon className="h-4 w-4 text-sand" />
              <span className="text-sm font-semibold">Verified on {v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
