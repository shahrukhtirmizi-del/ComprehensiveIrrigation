"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "ci-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {}
    if (stored) return;
    const id = window.setTimeout(() => setVisible(true), 1400);
    return () => window.clearTimeout(id);
  }, []);

  const choose = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ value, at: new Date().toISOString() }));
    } catch {}
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: value }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-md animate-[cookie-in_0.8s_var(--ease-out-soft)_both] rounded-[1.5rem] bg-white p-5 shadow-[var(--shadow-lift)] ring-1 ring-black/5 sm:left-6 sm:right-auto sm:bottom-6"
    >
      <p className="font-display text-lg text-charcoal">A quick note on cookies</p>
      <p className="mt-2 text-sm leading-relaxed text-stone">
        We use essential storage to run this site and remember your preferences. With your permission we may also use
        analytics to improve it. See our{" "}
        <Link href="/privacy" className="font-semibold text-forest underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => choose("accepted")} className="btn btn-primary flex-1 !py-3 text-sm">
          Accept
        </button>
        <button type="button" onClick={() => choose("declined")} className="btn btn-outline-dark flex-1 !py-3 text-sm">
          Essential only
        </button>
      </div>
      <style>{`@keyframes cookie-in{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
