"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";

/**
 * Site-wide scroll choreography, driven by data attributes so server components
 * can opt in without becoming client components:
 *
 *   data-reveal            → fades + slides up as it enters the viewport
 *   data-reveal-delay="n"  → optional delay in seconds
 *   data-split             → headline lines rise out of a mask, one after another
 *   data-stagger           → direct children fade in one at a time
 */
export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let splits: SplitText[] = [];
    let cancelled = false;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.09,
            delay: (i, el: Element) => Number((el as HTMLElement).dataset.revealDelay ?? 0),
          }),
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        gsap.from(group.children, {
          opacity: 0,
          y: 18,
          duration: 0.8,
          ease: "power2.out",
          stagger: Number(group.dataset.stagger) || 0.14,
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
        });
      });
    });

    // Split headlines once webfonts are in, so line breaks are measured correctly.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx.add(() => {
        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
          const split = SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) => {
              gsap.set(el, { visibility: "visible" });
              return gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.15,
                ease: "expo.out",
                stagger: 0.1,
                scrollTrigger: el.dataset.split === "load" ? undefined : { trigger: el, start: "top 88%", once: true },
                delay: el.dataset.split === "load" ? 0.25 : 0,
              });
            },
          });
          splits.push(split);
        });
      });
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      splits.forEach((s) => s.revert());
      splits = [];
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
