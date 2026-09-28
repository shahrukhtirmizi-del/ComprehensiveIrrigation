import { QuoteLink } from "@/components/ui/QuoteLink";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";

const routine = [
  "Cleaning filters, nozzles and irrigation lines for unrestricted flow",
  "Calibrating controllers and timers to prevent over- and under-watering",
  "Inspecting valves, pipes and fittings — repairing what's needed",
  "Seasonal adjustments tuned to Central Florida's wet and dry months",
];

export function MaintenanceProgram() {
  return (
    <section id="maintenance" aria-labelledby="maintenance-title" className="pb-24 md:pb-32">
      <div className="container-x">
        <div className="grid gap-5 overflow-hidden rounded-[2rem] bg-parchment p-6 sm:p-10 md:grid-cols-12 md:gap-10 md:p-14">
          <div className="md:col-span-6">
            <p className="eyebrow" data-reveal>
              Maintenance Program
            </p>
            <h2 id="maintenance-title" data-split className="mt-4 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.04] text-charcoal">
              The Comprehensive <em className="text-forest">Preferred</em> Program
            </h2>
            <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-stone" data-reveal>
              Regular, scheduled care for your irrigation system and landscape — so the small problems that waste water
              are caught long before they show up on your bill or your lawn.
            </p>
            <div className="mt-7 inline-flex items-center gap-3 rounded-[1.25rem] bg-white px-5 py-4 shadow-[var(--shadow-soft)]" data-reveal>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-white">
                <CheckIcon className="h-5 w-5" />
              </span>
              <p className="text-[0.95rem] font-semibold leading-snug text-charcoal">
                Service call fee waived for program customers
              </p>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-stone" data-reveal>
              Visit frequency, scope and pricing are set to your property. Ask for program terms with your free quote.
            </p>
            <div className="mt-8" data-reveal>
              <QuoteLink service="Maintenance Program" className="btn btn-primary">
                Ask about the program <ArrowRightIcon className="h-4 w-4" />
              </QuoteLink>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="h-full rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8" data-reveal>
              <p className="font-display text-xl text-charcoal">What regular irrigation care looks like</p>
              <ul className="mt-6 space-y-4" data-stagger="0.12">
                {routine.map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist font-display text-sm text-forest">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-[0.97rem] leading-relaxed text-ink">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 border-t border-black/5 pt-5 text-sm leading-relaxed text-stone">
                Efficiency upgrades — smart controllers, drip zones and rain sensors — are available on request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
