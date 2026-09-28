"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DropIcon } from "@/components/ui/Icons";

const TARGET = 30;
// SVG geometry (viewBox units)
const EMPTY_Y = 392; // water surface below the numeral's baseline
const FULL_Y = 58; // water surface above the numeral's cap height

// Two periods of a gentle sine, 1000 units wide each, so a -1000 translate loops seamlessly.
function wavePath(amp: number, period: number) {
  let d = `M0 0`;
  for (let x = 0; x < 2000; x += period) {
    d += ` Q${x + period / 4} ${-amp} ${x + period / 2} 0 T${x + period} 0`;
  }
  return `${d} L2000 700 L0 700 Z`;
}

export function WaterCallout() {
  const root = useRef<HTMLElement>(null);
  const water = useRef<SVGGElement>(null);
  const baseText = useRef<SVGTextElement>(null);
  const clipText = useRef<SVGTextElement>(null);
  const meter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const setLevel = (p: number) => {
        const value = Math.round(p * TARGET);
        const label = `${value}%`;
        if (baseText.current) baseText.current.textContent = label;
        if (clipText.current) clipText.current.textContent = label;
        if (meter.current) meter.current.textContent = String(value);
        water.current?.setAttribute("transform", `translate(0 ${EMPTY_Y + (FULL_Y - EMPTY_Y) * p})`);
      };

      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 768px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduce } = context.conditions as { desktop: boolean; reduce: boolean };
          if (reduce) {
            setLevel(1);
            return;
          }

          // Endless, lazy surface motion.
          gsap.to("[data-wave='back']", { x: -1000, duration: 9, ease: "none", repeat: -1 });
          gsap.to("[data-wave='front']", { x: -1000, duration: 5.5, ease: "none", repeat: -1 });

          const state = { p: 0 };
          setLevel(0);

          const tl = gsap.timeline({
            scrollTrigger: desktop
              ? { trigger: root.current, start: "top top", end: "+=130%", scrub: 0.8, pin: true, anticipatePin: 1 }
              : { trigger: root.current, start: "top 70%", end: "bottom 80%", scrub: 0.8 },
          });

          tl.to(state, { p: 1, duration: 1, ease: "power1.inOut", onUpdate: () => setLevel(state.p) })
            .from("[data-callout-line]", { opacity: 0, y: 24, stagger: 0.12, duration: 0.35, ease: "power2.out" }, 0.55)
            .from("[data-callout-badge]", { opacity: 0, scale: 0.9, duration: 0.3, ease: "back.out(2)" }, 0.8);
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="water-title" className="p-2 md:p-3">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-charcoal text-white md:flex md:min-h-[calc(100svh-1.5rem)] md:items-center md:rounded-[2.25rem]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 100%, color-mix(in oklab, var(--brand-sampled) 45%, transparent), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="container-x relative py-20 md:py-12">
          <div className="flex flex-col items-center text-center">
            <p className="eyebrow !text-sand">The water line</p>
            <h2 id="water-title" className="sr-only">
              Irrigation repair reduces up to 30% of water waste
            </h2>

            <div className="relative mt-4 w-full max-w-4xl md:w-[min(100%,calc((100svh-24rem)*2.33))]" aria-hidden>
              <svg viewBox="0 0 1000 430" className="w-full overflow-visible">
                <defs>
                  <clipPath id="numeral-clip">
                    <text
                      ref={clipText}
                      x="500"
                      y="372"
                      textAnchor="middle"
                      fontSize="410"
                      style={{ fontFamily: "var(--font-bricolage)", fontWeight: 800, letterSpacing: "-0.06em" }}
                    >
                      30%
                    </text>
                  </clipPath>
                  <linearGradient id="water-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a8d6de" />
                    <stop offset="55%" stopColor="#5c9fac" />
                    <stop offset="100%" stopColor="#2f6b6f" />
                  </linearGradient>
                </defs>

                {/* The "dry" numeral: a quiet solid fill, never an outline. */}
                <text
                  ref={baseText}
                  x="500"
                  y="372"
                  textAnchor="middle"
                  fontSize="410"
                  fill="rgb(255 255 255 / 0.07)"
                  style={{ fontFamily: "var(--font-bricolage)", fontWeight: 800, letterSpacing: "-0.06em" }}
                >
                  30%
                </text>

                <g clipPath="url(#numeral-clip)">
                  <g ref={water} transform={`translate(0 ${FULL_Y})`}>
                    <path data-wave="back" d={wavePath(12, 250)} fill="#bfe3e8" opacity="0.55" transform="translate(0 -8)" />
                    <path data-wave="front" d={wavePath(16, 500)} fill="url(#water-fill)" />
                  </g>
                </g>
              </svg>
            </div>

            <div className="-mt-2 max-w-2xl md:-mt-3">
              <p data-callout-line className="font-display text-[clamp(1.6rem,3.6vw,2.6rem)] leading-tight">
                Irrigation repair reduces up to <span className="text-sand-soft">30%</span> of water waste.
              </p>
              <p data-callout-line className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
                Leaking valves, cracked heads and zones watering the sidewalk quietly pour money down the drain. We find
                them, fix them, and set your system to use only what your lawn needs.
              </p>
              <p
                data-callout-badge
                className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/8 sm:rounded-full px-5 py-3 text-sm font-bold tracking-[0.14em] text-white ring-1 ring-white/15"
              >
                <DropIcon className="h-4 w-4 text-water" />
                It&apos;s the promise on our badge: DON&apos;T WASTE WATER!!
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/40">
                Up to <span ref={meter} className="tabular-nums text-white/80">30</span>% less water waste
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
