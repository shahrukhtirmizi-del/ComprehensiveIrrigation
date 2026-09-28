import type { ComponentType, SVGProps } from "react";
import { ArrowButton } from "@/components/ArrowButton";
import { ProgramPerksCard } from "./ProgramPerksCard";
import { CheckIcon, ClockIcon, DropIcon, LeafIcon, ShieldIcon } from "@/components/ui/Icons";

const routine: { text: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { text: "Cleaning filters, nozzles and irrigation lines for unrestricted flow", Icon: DropIcon },
  { text: "Calibrating controllers and timers to prevent over- and under-watering", Icon: ClockIcon },
  { text: "Inspecting valves, pipes and fittings — repairing what's needed", Icon: ShieldIcon },
  { text: "Seasonal adjustments tuned to Central Florida's wet and dry months", Icon: LeafIcon },
];

export function MaintenanceProgram() {
  return (
    <section id="maintenance" aria-labelledby="maintenance-title" className="py-24 md:py-32">
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
              <ArrowButton href="/#quote" service="Maintenance Program">
                Ask About the Program
              </ArrowButton>
            </div>
          </div>

          <div className="md:col-span-6">
            <ProgramPerksCard>
              <p className="font-display text-xl font-semibold tracking-[-0.02em] text-charcoal">What regular irrigation care looks like</p>
              <ul className="mt-6 space-y-4">
                {routine.map(({ text, Icon }) => (
                  <li key={text} className="flex items-start gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e9efe3] text-[#2e5b3f]" aria-hidden="true">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="pt-1.5 text-[0.97rem] leading-relaxed text-ink">{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 border-t border-black/5 pt-5 text-sm leading-relaxed text-stone">
                Efficiency upgrades — smart controllers, drip zones and rain sensors — are available on request.
              </p>
            </ProgramPerksCard>
          </div>
        </div>
      </div>
    </section>
  );
}
