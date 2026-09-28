"use client";

import { useRef, type CSSProperties } from "react";
import { preload } from "react-dom";
import { motion, useInView } from "motion/react";
import { ArrowRightIcon } from "@/components/ui/Icons";

/**
 * heroMedia — the one still behind the cinematic hero. The atmosphere comes from the gradient + grain
 * overlays and the pull-up headline, so swapping in a <video> later only means replacing the <img>.
 */
export const heroMedia = {
  src: "/images/hero-sunset-lake-home.jpg",
  alt: "Elevated view of a landscaped Florida home and manicured lawn at sunset, with a lake behind it",
};

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: CSSProperties;
}

const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`} style={style} aria-hidden>
      {words.map((word, index) => {
        const isLastWord = index === words.length - 1;
        return (
          <motion.span
            key={`${word}-${index}`}
            initial={{ y: 35, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block"
            style={{ marginRight: isLastWord ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLastWord && <span className="absolute -right-[0.3em] top-[0.65em] text-[0.31em]">*</span>}
          </motion.span>
        );
      })}
    </span>
  );
};

export function Hero() {
  preload(heroMedia.src, { as: "image", fetchPriority: "high" });

  return (
    <>
      <style>
        {`
          .ch-noise {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.28'/%3E%3C/svg%3E");
          }
        `}
      </style>

      <section aria-labelledby="hero-title" className="relative h-[100svh] min-h-[650px] w-full overflow-hidden bg-charcoal">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed hero still, preloaded above */}
        <img
          src={heroMedia.src}
          alt={heroMedia.alt}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full scale-[1.01] object-cover"
        />

        {/* Dark cinematic overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-black/70" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
        <div className="ch-noise pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-soft-light" />

        {/* Hero content — the site's real header / logo sits above this in the layout */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-5 md:px-10 md:pb-7 lg:px-12">
          <div className="grid grid-cols-12 items-end gap-5 lg:gap-8">
            <div className="col-span-12 lg:col-span-8">
              <h1
                id="hero-title"
                className="whitespace-nowrap font-display text-[15.2vw] font-bold leading-[0.8] tracking-[-0.075em] lg:text-[10.2vw]"
                style={{ color: "#F7F4EE" }}
              >
                <WordsPullUp text="Comprehensive" showAsterisk />
                <span className="sr-only">Comprehensive Irrigation and Lawn Services — irrigation repair and lawn care in Davenport, FL</span>
              </h1>
            </div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="group col-span-12 flex cursor-default flex-col items-start gap-5 pb-1 lg:col-span-4 lg:pb-6"
            >
              <p className="max-w-[520px] text-sm font-medium leading-[1.3] text-cream/80 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-white md:text-base">
                25+ years serving Central Florida&apos;s green industry. Licensed &amp; insured (SCC 131152213). Irrigation
                repair alone cuts water waste by up to 30%.
              </p>

              <motion.a
                href="#quote"
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-4 rounded-full bg-charcoal py-1 pl-5 pr-1 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:gap-6 group-hover:bg-white group-hover:text-charcoal sm:text-base"
              >
                <span>Get a Free Quote</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-charcoal transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[-35deg] group-hover:bg-charcoal group-hover:text-white sm:h-11 sm:w-11">
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </motion.a>
            </motion.div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-px bg-white/25" />
      </section>
    </>
  );
}
