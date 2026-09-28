"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { HERO_EXPAND_EVENT, HERO_STATE_EVENT } from "@/lib/events";

type MediaType = "video" | "image";

interface ScrollExpandMediaProps {
  mediaType?: MediaType;
  mediaSrc: string;
  mediaAlt?: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll-to-expand hero. While the media is collapsed, wheel / touch / keys grow it instead of
 * scrolling the page; once it fills the frame, normal (Lenis) scrolling resumes and the content
 * underneath fades in. Scrolling back to the very top collapses it again.
 */
export default function ScrollExpandMedia({
  mediaType = "video",
  mediaSrc,
  mediaAlt,
  posterSrc,
  bgImageSrc,
  title = "",
  textBlend = false,
  children,
}: ScrollExpandMediaProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(900);
  const progressRef = useRef(0);
  const expandedRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { stop, start } = useSmoothScroll();

  const updateProgress = useCallback((nextProgress: number) => {
    const clampedProgress = Math.min(Math.max(nextProgress, 0), 1);
    progressRef.current = clampedProgress;
    setScrollProgress(clampedProgress);
    if (clampedProgress >= 1) {
      expandedRef.current = true;
      setMediaFullyExpanded(true);
      setShowContent(true);
    } else {
      expandedRef.current = false;
      setMediaFullyExpanded(false);
      if (clampedProgress < 0.75) setShowContent(false);
    }
  }, []);

  // Start collapsed at the top — unless the visitor arrived on a deep link or prefers less motion.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (window.location.hash || prefersReducedMotion()) {
        updateProgress(1);
        return;
      }
      window.scrollTo(0, 0);
      touchStartYRef.current = null;
      updateProgress(0);
    });
    return () => cancelAnimationFrame(frame);
  }, [mediaType, updateProgress]);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
      setViewportHeight(window.innerHeight);
    };
    const frame = requestAnimationFrame(checkViewport);
    window.addEventListener("resize", checkViewport);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const currentlyExpanded = expandedRef.current;
      const currentProgress = progressRef.current;
      const isAtPageTop = window.scrollY <= 5;
      if (currentlyExpanded) {
        if (event.deltaY < 0 && isAtPageTop) {
          event.preventDefault();
          expandedRef.current = false;
          setMediaFullyExpanded(false);
          updateProgress(currentProgress + event.deltaY * 0.0009);
        }
        return;
      }
      event.preventDefault();
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      updateProgress(currentProgress + event.deltaY * 0.0009);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (event: TouchEvent) => {
      const previousTouchY = touchStartYRef.current;
      if (previousTouchY === null) return;
      const currentTouchY = event.touches[0]?.clientY;
      if (currentTouchY === undefined) return;
      const deltaY = previousTouchY - currentTouchY;
      const currentlyExpanded = expandedRef.current;
      const isAtPageTop = window.scrollY <= 5;
      if (currentlyExpanded) {
        if (deltaY < -20 && isAtPageTop) {
          event.preventDefault();
          expandedRef.current = false;
          setMediaFullyExpanded(false);
          updateProgress(progressRef.current + deltaY * 0.008);
        }
        touchStartYRef.current = currentTouchY;
        return;
      }
      event.preventDefault();
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      const sensitivity = deltaY < 0 ? 0.008 : 0.005;
      updateProgress(progressRef.current + deltaY * sensitivity);
      touchStartYRef.current = currentTouchY;
    };
    const handleTouchEnd = () => {
      touchStartYRef.current = null;
    };
    const handleScroll = () => {
      if (!expandedRef.current && window.scrollY !== 0) window.scrollTo(0, 0);
    };

    // Keyboard scrolling: the same keys that would scroll the page expand / collapse the media.
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const forward = ["ArrowDown", "PageDown", " ", "End"].includes(event.key) && !(event.key === " " && event.shiftKey);
      const back = ["ArrowUp", "PageUp", "Home"].includes(event.key) || (event.key === " " && event.shiftKey);
      if (!expandedRef.current && (forward || back)) {
        event.preventDefault();
        updateProgress(progressRef.current + (forward ? 0.34 : -0.34));
      } else if (expandedRef.current && back && window.scrollY <= 5) {
        event.preventDefault();
        updateProgress(0.66);
      }
    };

    // Tabbing (or navigating) to anything below the hero opens it up first.
    const handleFocus = (event: FocusEvent) => {
      if (expandedRef.current) return;
      const target = event.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target) && target !== document.body) updateProgress(1);
    };
    const handleExpand = () => updateProgress(1);

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKey);
    document.addEventListener("focusin", handleFocus);
    window.addEventListener(HERO_EXPAND_EVENT, handleExpand);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("focusin", handleFocus);
      window.removeEventListener(HERO_EXPAND_EVENT, handleExpand);
    };
  }, [updateProgress]);

  // Lock the page (and pause the smooth scroller) until the media has fully opened.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    window.dispatchEvent(new CustomEvent(HERO_STATE_EVENT, { detail: mediaFullyExpanded }));
    if (!mediaFullyExpanded) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
      stop();
    } else {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      start();
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      start();
    };
  }, [mediaFullyExpanded, stop, start]);

  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const displayedMediaHeight = Math.min(mediaHeight, viewportHeight * 0.85);
  const indicatorTop = viewportHeight / 2 + displayedMediaHeight / 2 + 34;
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);
  const titleWords = title.trim().split(/\s+/);
  const firstWord = titleWords[0] ?? "";
  const restWords = titleWords.slice(1);
  const accentWord = restWords.length > 1 ? restWords[restWords.length - 1] : "";
  const leadWords = accentWord ? restWords.slice(0, -1).join(" ") : restWords.join(" ");

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-clip bg-cream">
      <section aria-labelledby="hero-title" className="relative min-h-[100dvh] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0"
          animate={{ opacity: 1 - scrollProgress, scale: 1 + scrollProgress * 0.05 }}
          transition={{ duration: 0.1, ease: "linear" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed decorative backdrop, preloaded in layout */}
          <img src={bgImageSrc} alt="" draggable={false} fetchPriority="high" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-charcoal/25" />
        </motion.div>

        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1800px] flex-col items-center">
          <div className="relative flex min-h-[100dvh] w-full items-center justify-center">
            <div
              className="absolute left-1/2 top-1/2 overflow-hidden rounded-[1.75rem]"
              style={{
                width: `${mediaWidth}px`,
                height: `${mediaHeight}px`,
                maxWidth: "95vw",
                maxHeight: "85vh",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 30px 100px rgba(20, 24, 18, 0.42)",
                willChange: "width, height",
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[1.75rem]">
                {mediaType === "video" ? (
                  <video src={mediaSrc} poster={posterSrc} autoPlay muted loop playsInline className="h-full w-full object-cover" aria-label={mediaAlt ?? title} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- size is animated every frame; next/image adds nothing here
                  <img src={mediaSrc} alt={mediaAlt ?? title} draggable={false} fetchPriority="high" className="h-full w-full object-cover" />
                )}
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-charcoal"
                  animate={{ opacity: 0.5 - scrollProgress * 0.28 }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            </div>

            <h1
              id="hero-title"
              aria-label={title}
              className={`pointer-events-none relative z-20 flex w-full flex-col items-center justify-center gap-2 px-4 text-center font-display text-[clamp(3rem,8vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.045em] text-cream ${
                textBlend ? "mix-blend-difference" : "mix-blend-normal"
              }`}
            >
              <span aria-hidden className="block" style={{ transform: `translateX(-${textTranslateX}vw)`, willChange: "transform" }}>
                {firstWord}
              </span>
              <span aria-hidden className="block" style={{ transform: `translateX(${textTranslateX}vw)`, willChange: "transform" }}>
                {leadWords} {accentWord && <em className="font-light italic">{accentWord}</em>}
              </span>
            </h1>

            <motion.div
              className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2"
              style={{ top: `${indicatorTop}px` }}
              animate={{ opacity: scrollProgress < 0.16 ? 1 : 0, y: scrollProgress < 0.16 ? 0 : 12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              aria-hidden
            >
              <div className="flex flex-col items-center justify-center gap-3 text-white">
                <span className="text-center text-[11px] font-semibold uppercase tracking-[0.32em]">Scroll</span>
                <div className="flex h-11 w-7 justify-center rounded-full border border-white/50 p-1.5">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-white"
                    animate={{ y: [0, 20, 0], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="w-full px-5 py-12 md:px-16 lg:py-24"
            initial={false}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 40 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ pointerEvents: showContent ? "auto" : "none" }}
          >
            {children}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
