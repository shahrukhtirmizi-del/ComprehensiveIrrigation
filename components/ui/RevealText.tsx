"use client";

import { motion, useInView } from "motion/react";
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
}

/**
 * One big word, letter by letter; hovering (or tapping) a letter fills it with a photo.
 * The entrance and the colour sweep start when the word scrolls into view, not on page load.
 */
export function RevealText({
  text = "Thrive",
  textColor = "text-white",
  overlayColor = "text-[#2F5233]",
  fontSize = "text-[clamp(70px,16vw,250px)]",
  letterDelay = 0.08,
  overlayDelay = 0.05,
  overlayDuration = 0.4,
  springDuration = 600,
  letterImages = [],
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
    <div ref={ref} className="relative flex items-center justify-center px-4">
      <span className="sr-only">{text}</span>
      <div className="flex" aria-hidden>
        {text.split("").map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onPointerDown={(e) => e.pointerType !== "mouse" && setHoveredIndex((h) => (h === index ? null : index))}
            className={`${fontSize} relative inline-block cursor-pointer overflow-hidden font-display font-extrabold leading-[0.82] tracking-[-0.09em]`}
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
                backgroundImage: letterImages.length ? `url("${letterImages[index % letterImages.length]}")` : undefined,
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
  );
}
