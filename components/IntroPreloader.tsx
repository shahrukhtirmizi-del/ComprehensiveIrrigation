"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import SplitRevealHero from "@/components/SplitRevealHero";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

export const INTRO_SEEN_KEY = "ci-intro-seen";
const HOLD_MS = 450; // pause on the finished card before handing over
const LEAVE_MS = 900; // fade + card shrink into the hero's media frame

// Read once per page load from the class the head script set; the server always renders the overlay
// (CSS hides it pre-paint when skipped), then the client drops it.
const noopSubscribe = () => () => {};
const readSkip = () => document.documentElement.classList.contains("intro-skip");

/**
 * Site intro: the split-curtain typography reveal plays full-screen over the homepage, then fades away
 * onto the scroll-expansion hero underneath (same lawn photo, and the card shrinks toward the hero's
 * media frame, so the hand-off reads as one shot).
 *
 * Plays once per browser session. An inline script in app/layout.tsx adds `intro-skip` to <html> before
 * first paint for repeat visits, reduced-motion visitors and deep links (/#quote …), so the overlay never
 * flashes for them; without JS it is never shown at all (see .ci-intro in globals.css).
 */
export default function IntroPreloader() {
  const skip = useSyncExternalStore(noopSubscribe, readSkip, () => false);
  const [phase, setPhase] = useState<"playing" | "leaving" | "done">("playing");
  const { stop, start } = useSmoothScroll();
  const timers = useRef<number[]>([]);
  const leaving = useRef(false);

  const finish = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    setPhase("leaving");
    start();
    document.documentElement.style.overflow = "";
    timers.current.push(window.setTimeout(() => setPhase("done"), LEAVE_MS));
  }, [start]);

  useEffect(() => {
    const pending = timers.current;
    // Read the flag directly: during hydration `skip` still holds the server value (false), and pausing
    // scroll here on a skipped visit would leave the page locked.
    if (readSkip()) return;
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {}
    window.scrollTo(0, 0);
    stop();
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      pending.forEach(window.clearTimeout);
      document.documentElement.style.overflow = "";
    };
  }, [stop, finish]);

  const onComplete = useCallback(() => {
    timers.current.push(window.setTimeout(finish, HOLD_MS));
  }, [finish]);

  if (skip || phase === "done") return null;

  return (
    <div className={`ci-intro${phase === "leaving" ? " is-leaving" : ""}`}>
      <SplitRevealHero onComplete={onComplete} />
      <button type="button" onClick={finish} className="ci-intro-skip">
        Skip intro
      </button>
    </div>
  );
}
