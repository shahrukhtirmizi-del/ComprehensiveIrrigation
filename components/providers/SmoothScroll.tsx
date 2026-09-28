"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

type ScrollApi = {
  scrollTo: (target: string | HTMLElement | number, opts?: { offset?: number; immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
};

const ScrollContext = createContext<ScrollApi | null>(null);

export function useSmoothScroll() {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useSmoothScroll must be used inside <SmoothScroll>");
  return ctx;
}

const HEADER_OFFSET = -84;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  // Children (e.g. an overlay menu) can ask to pause scrolling before Lenis exists; remember it.
  const stoppedRef = useRef(false);
  // A destination requested while scrolling was paused; travelled to the moment scrolling resumes.
  const pendingRef = useRef<{ target: string | HTMLElement | number; offset?: number } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    // Slightly weighted, never floaty.
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    lenisRef.current = lenis;
    if (stoppedRef.current) lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback<ScrollApi["scrollTo"]>((target, opts = {}) => {
    const offset = opts.offset ?? HEADER_OFFSET;
    const lenis = lenisRef.current;
    if (lenis) {
      // Paused by an overlay (e.g. the drape menu): Lenis resets on start(), which would cancel a
      // scroll begun now, so hold the destination until scrolling resumes.
      if (stoppedRef.current) {
        pendingRef.current = { target, offset: opts.offset };
        return;
      }
      // Re-measure first: after a client-side route change Lenis still knows the old page's height
      // and would clamp the destination to it.
      lenis.resize();
      lenis.scrollTo(target, { offset, immediate: opts.immediate, duration: 1.4 });
      return;
    }
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (typeof el === "number") window.scrollTo({ top: el, behavior: "smooth" });
    else if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
  }, []);

  const api = useMemo<ScrollApi>(
    () => ({
      scrollTo,
      stop: () => {
        stoppedRef.current = true;
        lenisRef.current?.stop();
      },
      start: () => {
        stoppedRef.current = false;
        lenisRef.current?.start();
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending) requestAnimationFrame(() => scrollTo(pending.target, { offset: pending.offset }));
      },
    }),
    [scrollTo],
  );

  // Route in-page anchor clicks (e.g. "/#quote") through the smooth scroller.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href*='#']");
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const el = document.querySelector<HTMLElement>(decodeURIComponent(url.hash));
      if (!el) return;
      e.preventDefault();
      history.replaceState(null, "", url.hash);
      scrollTo(el);
    };
    // Capture phase: runs before next/link's handler, which then sees defaultPrevented and stands down.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [scrollTo]);

  // Arriving on "/#section" from another page: land on the section after layout settles.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      lenisRef.current?.scrollTo(0, { immediate: true });
      return;
    }
    const id = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(decodeURIComponent(hash));
      if (el) scrollTo(el, { immediate: true });
    }, 120);
    return () => window.clearTimeout(id);
  }, [pathname, scrollTo]);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
