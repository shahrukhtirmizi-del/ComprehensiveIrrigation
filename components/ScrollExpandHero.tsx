"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform } from "framer-motion";

export interface ScrollExpandHeroProps {
  /** The photo in the frame that expands to full-bleed. */
  mediaSrc?: string;
  mediaAlt?: string;
  /** Full-bleed backdrop behind the frame; fades out as the frame takes over. Matches the intro's photo. */
  bgImageSrc?: string;
  title?: string;
  /** Shown over the fully expanded photo. */
  children?: ReactNode;
}

// Clamped linear map. Opacities below go through function-form transforms on purpose: framer-motion hands
// range-form scroll-linked opacity to the browser's native ScrollTimeline, and for a partial range
// (e.g. 0.7→0.85) that path doesn't hold the end value, so the copy faded back out as you kept scrolling.
const map = (v: number, [a, b]: [number, number], [from, to]: [number, number]) =>
  from + (to - from) * Math.min(1, Math.max(0, (v - a) / (b - a)));

/**
 * Scroll-expansion hero. A compact photo frame grows to fill the screen as you scroll while the title's
 * two halves slide apart; once it's full-bleed, the hero copy and CTAs fade in over it.
 *
 * Driven by ordinary page scroll through a tall section with a sticky stage (framer-motion useScroll),
 * not by intercepting the wheel: that keeps the shared Lenis smooth scroll, keyboard, scrollbar, touch
 * and every in-page link (header "Get a Free Quote", menu, /#section deep links) working at all times.
 */
export default function ScrollExpandHero({
  mediaSrc = "/images/hero-sunset-lake-home.jpg",
  mediaAlt = "Landscaped Florida home and manicured lawn at sunset, with a lake behind it",
  bgImageSrc = "/images/hero-lawn.jpg",
  title = "Comprehensive Irrigation",
  children,
}: ScrollExpandHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // Expansion takes the first 75% of the section; the rest holds the full-bleed photo with the copy on it.
  const p = useTransform(scrollYProgress, (v) => map(v, [0, 0.75], [0, 1]));
  const width = useMotionTemplate`calc(var(--sx-w) + (100vw - var(--sx-w)) * ${p})`;
  const height = useMotionTemplate`calc(var(--sx-h) + (100svh - var(--sx-h)) * ${p})`;
  const radius = useTransform(p, [0, 1], [18, 0]);
  const bgOpacity = useTransform(p, (v) => 1 - v);
  const bgScale = useTransform(p, [0, 1], [1, 1.05]);
  const shade = useTransform(p, (v) => map(v, [0, 1], [0.5, 0.22]));
  const leftX = useTransform(p, (v) => `${-v * 150}vw`);
  const rightX = useTransform(p, (v) => `${v * 150}vw`);
  const cueOpacity = useTransform(p, (v) => map(v, [0, 0.14], [1, 0]));
  const contentOpacity = useTransform(scrollYProgress, (v) => map(v, [0.7, 0.85], [0, 1]));
  const contentY = useTransform(scrollYProgress, (v) => map(v, [0.7, 0.85], [40, 0]));

  const [interactive, setInteractive] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setInteractive(v > 0.75));

  const [firstWord, ...rest] = title.trim().split(/\s+/);
  const secondLine = rest.join(" ");

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className="relative h-[300svh] bg-[#1f3d2b]">
      <div className="sticky top-0 h-[100svh] overflow-hidden [--sx-h:min(400px,52svh)] [--sx-w:min(300px,64vw)]">
        {/* Backdrop — same photo the intro's curtains open onto. */}
        <motion.div className="absolute inset-0" style={{ opacity: bgOpacity, scale: bgScale }} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- same URL as the intro, so it's one download */}
          <img src={bgImageSrc} alt="" draggable={false} fetchPriority="high" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#1f3d2b]/30" />
        </motion.div>

        {/* The expanding frame */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-[0_30px_100px_rgb(31_61_43/0.45)]"
          style={{ width, height, borderRadius: radius }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- resized every frame; plain img avoids the optimizer wrapper */}
          <img src={mediaSrc} alt={mediaAlt} draggable={false} className="h-full w-full object-cover" />
          <motion.div className="pointer-events-none absolute inset-0 bg-[#1f3d2b]" style={{ opacity: shade }} />
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1f3d2b]/85 via-[#1f3d2b]/25 to-transparent"
            style={{ opacity: contentOpacity }}
          />
        </motion.div>

        {/* Title halves slide apart as the frame grows */}
        <h1
          id="hero-title"
          className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 px-4 text-center font-display text-[clamp(2.6rem,7vw,7rem)] font-bold uppercase leading-[0.9] tracking-[-0.06em] text-[#f6f2e8] [text-shadow:0_6px_40px_rgb(31_61_43/0.45)]"
        >
          <motion.span className="block" style={{ x: leftX }}>
            {firstWord}
          </motion.span>{" "}
          <motion.span className="block" style={{ x: rightX }}>
            {secondLine}
          </motion.span>
          <span className="sr-only"> — irrigation repair, sprinkler maintenance and lawn care in Davenport, FL</span>
        </h1>

        {/* Scroll cue */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[calc(50%+var(--sx-h)/2+28px)] z-[3] flex -translate-x-1/2 flex-col items-center gap-3 text-[#f6f2e8]"
          style={{ opacity: cueOpacity }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em]">Scroll</span>
          <span className="flex h-11 w-7 justify-center rounded-full border border-white/50 p-1.5">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-white"
              animate={{ y: [0, 20, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.div>

        {/* Hero copy over the full-bleed photo */}
        {children && (
          <motion.div
            className="absolute inset-x-0 bottom-0 z-[4]"
            style={{ opacity: contentOpacity, y: contentY, pointerEvents: interactive ? "auto" : "none" }}
            // Not focusable or clickable until it has faded in.
            inert={!interactive}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
