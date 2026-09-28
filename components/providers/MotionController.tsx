"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";

/**
 * Site-wide entrance choreography, driven by data attributes so server components
 * can opt in without becoming client components:
 *
 *   data-reveal            → fades + slides up as it enters the viewport
 *   data-reveal-delay="n"  → optional delay in seconds
 *   data-split             → headline lines rise out of a mask, one after another ("load" = on page load)
 *   data-stagger           → direct children fade in one at a time
 *
 * Everything is triggered by IntersectionObserver rather than precomputed scroll positions, so late
 * layout shifts (the expanding hero, pinned sections, images loading) can never strand content hidden.
 */
export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const splits: SplitText[] = [];
    const tweens: gsap.core.Tween[] = [];
    const onEnter = new Map<Element, () => void>();
    let cancelled = false;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          onEnter.get(entry.target)?.();
          onEnter.delete(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const whenVisible = (el: Element, run: () => void) => {
      onEnter.set(el, run);
      io.observe(el);
    };

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) =>
      whenVisible(el, () =>
        tweens.push(gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: Number(el.dataset.revealDelay ?? 0) })),
      ),
    );

    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
      const items = Array.from(group.children);
      gsap.set(items, { opacity: 0, y: 18 });
      whenVisible(group, () =>
        tweens.push(gsap.to(items, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: Number(group.dataset.stagger) || 0.14 })),
      );
    });

    // Split headlines once webfonts are in, so line breaks are measured correctly.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        let revealed = false;
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(el, { visibility: "visible" });
            // Re-splits after a resize keep already-revealed lines in place.
            if (!revealed) gsap.set(self.lines, { yPercent: 110 });
          },
        });
        splits.push(split);
        const play = () => {
          revealed = true;
          tweens.push(gsap.to(split.lines, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.1, delay: el.dataset.split === "load" ? 0.25 : 0 }));
        };
        if (el.dataset.split === "load") play();
        else whenVisible(el, play);
      });
    });

    return () => {
      cancelled = true;
      io.disconnect();
      tweens.forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
    };
  }, [pathname]);

  return null;
}
