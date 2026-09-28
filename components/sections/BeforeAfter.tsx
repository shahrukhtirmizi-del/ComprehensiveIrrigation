"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export function BeforeAfter() {
  const frame = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const dragging = useRef(false);

  const apply = useCallback((value: number) => {
    const v = Math.min(100, Math.max(0, value));
    pos.current = v;
    frame.current?.style.setProperty("--pos", `${v}%`);
    handle.current?.setAttribute("aria-valuenow", String(Math.round(v)));
  }, []);

  const fromPointer = (clientX: number) => {
    const r = frame.current?.getBoundingClientRect();
    if (!r) return;
    apply(((clientX - r.left) / r.width) * 100);
  };

  // A gentle "try me" sweep the first time it comes into view.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const state = { v: 50 };
      gsap
        .timeline({
          scrollTrigger: { trigger: frame.current, start: "top 70%", once: true },
          onUpdate: () => {
            if (!dragging.current) apply(state.v);
          },
        })
        .to(state, { v: 72, duration: 1, ease: "power2.inOut" })
        .to(state, { v: 32, duration: 1.2, ease: "power2.inOut" })
        .to(state, { v: 50, duration: 0.9, ease: "power2.inOut" });
    },
    { scope: frame },
  );

  return (
    <section id="results" aria-labelledby="results-title" className="py-24 md:py-32">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow" data-reveal>
            Results
          </p>
          <h2 id="results-title" data-split className="mt-4 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[1] text-charcoal">
            See the <em className="text-forest">Difference.</em>
          </h2>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-stone" data-reveal>
            Patchy, weed-choked turf on one side. Dense, even, properly watered lawn on the other. Drag the handle to
            compare.
          </p>
        </div>

        <div data-reveal className="mt-12">
          <div
            ref={frame}
            className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden rounded-[2rem] bg-charcoal shadow-[var(--shadow-lift)] sm:aspect-[4/3] lg:aspect-[16/9]"
            style={{ "--pos": "50%" } as React.CSSProperties}
            onPointerDown={(e) => {
              dragging.current = true;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              fromPointer(e.clientX);
            }}
            onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
          >
            <Image
              src="/images/before-overgrown-lawn.jpg"
              alt="Before: overgrown, patchy lawn with dry brown areas and weeds along a front walkway"
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="pointer-events-none object-cover"
              draggable={false}
            />
            <div className="absolute inset-0" style={{ clipPath: "inset(0 0 0 var(--pos))" }}>
              <Image
                src="/images/after-manicured-lawn.jpg"
                alt="After: thick, evenly striped green lawn and tidy landscape beds in front of a Florida home"
                fill
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="pointer-events-none object-cover"
                draggable={false}
              />
            </div>

            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-charcoal/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur md:left-6 md:top-6">
              Before
            </span>
            <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-charcoal backdrop-blur md:right-6 md:top-6">
              After
            </span>

            {/* Divider + handle */}
            <div className="pointer-events-none absolute inset-y-0 w-[2px] -translate-x-1/2 bg-white/90 shadow-[0_0_20px_rgb(0_0_0/0.3)]" style={{ left: "var(--pos)" }} />
            <div
              ref={handle}
              role="slider"
              tabIndex={0}
              aria-label="Before and after comparison"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={50}
              aria-valuetext="Drag to compare before and after"
              onKeyDown={(e) => {
                const step = e.shiftKey ? 10 : 4;
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") apply(pos.current - step);
                else if (e.key === "ArrowRight" || e.key === "ArrowUp") apply(pos.current + step);
                else if (e.key === "Home") apply(0);
                else if (e.key === "End") apply(100);
                else return;
                e.preventDefault();
              }}
              className="absolute top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full bg-white text-charcoal shadow-[var(--shadow-lift)] transition-transform duration-300 hover:scale-105 active:cursor-grabbing active:scale-95"
              style={{ left: "var(--pos)" }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 6-6 6 6 6M15 6l6 6-6 6" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-stone/80">Illustrative imagery.</p>
        </div>
      </div>
    </section>
  );
}
