import { business } from "@/lib/site";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/Icons";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="p-2 pb-3 md:p-3 md:pb-4">
      <div
        className="relative overflow-hidden rounded-[1.75rem] px-6 py-24 text-center text-white md:rounded-[2.25rem] md:py-36"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, color-mix(in oklab, var(--brand-sampled) 85%, #9ccf86) 0%, var(--color-forest) 45%, var(--color-forest-deep) 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow !text-sand-soft" data-reveal>
            Don&apos;t waste water
          </p>
          <h2 id="final-cta-title" data-split className="mt-5 font-display text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.95] tracking-[-0.06em]">
            Ready to Stop <em className="text-sand-soft">Wasting</em> Water?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/75 md:text-lg" data-reveal>
            Get a free, no-obligation quote from a licensed, insured team with more than 25 years in the green
            industry.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row" data-reveal>
            <a href="#quote" className="btn btn-primary !bg-white !px-8 !py-[1.1rem] text-base !text-charcoal">
              Get a Free Quote <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a href={business.phoneHref} className="btn btn-ghost !px-8 !py-[1.1rem] text-base">
              <PhoneIcon className="h-4 w-4" /> {business.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
