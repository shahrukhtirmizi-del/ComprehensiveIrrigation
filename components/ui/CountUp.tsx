"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
};

/** Counts from zero once it scrolls into view. Server-renders the final value for SEO / no-JS. */
export function CountUp({ to, prefix = "", suffix = "", duration = 2, delay = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const state = { v: 0 };
      el.textContent = `${prefix}0${suffix}`;
      gsap.to(state, {
        v: to,
        duration,
        delay,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(state.v)}${suffix}`;
        },
        scrollTrigger: { trigger: el, start: "top bottom", once: true },
      });
    },
    { dependencies: [to] },
  );

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {prefix}
      {to}
      {suffix}
    </span>
  );
}
