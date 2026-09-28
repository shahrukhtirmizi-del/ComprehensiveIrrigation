"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The Preferred Program's perks card: fades and rises into place the first time it scrolls into view,
 * and lifts on hover. Starts visible for no-JS and reduced-motion visitors.
 */
export function ProgramPerksCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at mount (e.g. arriving via /#maintenance): don't hide it only to fade it back.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;
    setState("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("shown");
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`h-full rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-soft)] transition-[opacity,translate,box-shadow] duration-700 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-[0_4px_8px_rgb(31_61_43/0.06),0_34px_60px_-20px_rgb(31_61_43/0.38)] sm:p-8 ${
        state === "hidden" ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      {children}
    </div>
  );
}
