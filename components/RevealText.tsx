"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface RevealTextProps {
  text?: string;
  textColor?: string;
  overlayColor?: string;
  fontSize?: string;
  letterDelay?: number;
  overlayDelay?: number;
  overlayDuration?: number;
  springDuration?: number;
  letterImages?: string[];
  /** Photo behind the word, under a dark green wash. */
  backgroundImage?: string;
}

/**
 * One big word, letter by letter; hovering a letter fills it with one of our job photos. The entrance
 * and the colour sweep wait until the word scrolls into view — it sits far down the page, so starting
 * on load would mean nobody ever saw it.
 */
export function RevealText({
  text = "TRUSTED",
  textColor = "text-white",
  overlayColor = "text-[#7fd99a]",
  fontSize = "text-[clamp(60px,15vw,220px)]",
  letterDelay = 0.08,
  overlayDelay = 0.05,
  overlayDuration = 0.4,
  springDuration = 600,
  letterImages = [
    "/images/hero-lawn.jpg",
    "/images/gallery-7.jpg",
    "/images/gallery-3.jpg",
    "/images/gallery-1.jpg",
    "/images/gallery-9.jpg",
    "/images/gallery-8.jpg",
    "/images/gallery-5.jpg",
  ],
  backgroundImage = "/images/gallery-7.jpg",
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showOverlayText, setShowOverlayText] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const lastLetterDelay = Math.max(0, text.length - 1) * letterDelay;
    const totalDelay = lastLetterDelay * 1000 + springDuration;
    const timer = window.setTimeout(() => setShowOverlayText(true), totalDelay);
    return () => window.clearTimeout(timer);
  }, [inView, text, letterDelay, springDuration]);

  return (
    <section
      aria-label={text}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1f3d2b]"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image src={backgroundImage} alt="" fill sizes="100vw" quality={70} className="object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(31_61_43/0.62),rgb(31_61_43/0.9)_75%)]" />
      </div>
      <div ref={ref} className="relative flex items-center justify-center px-4" aria-hidden="true">
        <div className="flex">
          {text.split("").map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              // Tight set via a negative margin rather than letter-spacing: letter-spacing shrank each
              // overflow-hidden box narrower than its glyph and clipped the edges (the D of TRUSTED).
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`${fontSize} relative -mr-[0.07em] inline-block cursor-pointer overflow-hidden font-black leading-[0.82] last:mr-0`}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ delay: index * letterDelay, type: "spring", damping: 8, stiffness: 200, mass: 0.8 }}
            >
              <span className="invisible">{letter}</span>

              <motion.span
                className={`absolute inset-0 ${textColor}`}
                animate={{ opacity: hoveredIndex === index ? 0 : 1 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                {letter}
              </motion.span>

              <motion.span
                className="absolute inset-0 bg-cover bg-no-repeat text-transparent"
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                  backgroundPosition: hoveredIndex === index ? "80% center" : "10% center",
                }}
                transition={{
                  opacity: { duration: 0.12, ease: "easeOut" },
                  backgroundPosition: { duration: 3, ease: "easeInOut" },
                }}
                style={{
                  backgroundImage: `url("${letterImages[index % letterImages.length]}")`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {letter}
              </motion.span>

              {showOverlayText && (
                <motion.span
                  className={`${overlayColor} pointer-events-none absolute inset-0`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ delay: index * overlayDelay, duration: overlayDuration, times: [0, 0.1, 0.7, 1], ease: "easeInOut" }}
                >
                  {letter}
                </motion.span>
              )}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RevealText;
