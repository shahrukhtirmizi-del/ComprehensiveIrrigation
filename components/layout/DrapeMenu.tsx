"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { business } from "@/lib/site";

const W = 1131;
const H = 861;
const CX = W / 2;

const LINKS = [
  { label: "services", href: "/#services" },
  { label: "our work", href: "/#work" },
  { label: "about", href: "/#about" },
  { label: "reviews", href: "/#reviews" },
  { label: "service area", href: "/#service-area" },
  { label: "get a quote", href: "/#quote" },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const pow4in = (t: number) => t * t * t * t;
const pow4out = (t: number) => 1 - Math.pow(1 - t, 4);
const pow3in = (t: number) => t * t * t;
const pow3out = (t: number) => 1 - Math.pow(1 - t, 3);

// The drape falls from the top edge with a curved hem…
const openPath = (t: number) => {
  let by: number, cy: number;
  if (t < 0.5) {
    const u = pow4in(t / 0.5);
    by = lerp(0, 345, u);
    cy = lerp(0, 620, u);
  } else {
    const u = pow4out((t - 0.5) / 0.5);
    by = lerp(345, H, u);
    cy = lerp(620, H, u);
  }
  return `M${W},${by.toFixed(1)} Q${CX},${cy.toFixed(1)} 0,${by.toFixed(1)} L0,0 L${W},0 Z`;
};

// …and is drawn back down and away when closing.
const closePath = (t: number) => {
  let ty: number, cy: number;
  if (t < 0.5) {
    const u = pow3in(t / 0.5);
    ty = lerp(0, 350, u);
    cy = lerp(0, 130, u);
  } else {
    const u = pow3out((t - 0.5) / 0.5);
    ty = lerp(350, H, u);
    cy = lerp(130, H, u);
  }
  return `M${W},${ty.toFixed(1)} Q${CX},${cy.toFixed(1)} 0,${ty.toFixed(1)} L0,${H} L${W},${H} Z`;
};

const HIDDEN = `M${W},0 Q${CX},0 0,0 L0,0 L${W},0 Z`;
const FULL = `M${W},${H} Q${CX},${H} 0,${H} L0,0 L${W},0 Z`;
const MORPH_MS = 1050;

const css = `
  .dm-toggle{position:relative;height:3rem;min-width:5.6rem;padding:0 1.1rem;border-radius:999px;cursor:pointer;
    text-transform:uppercase;font-size:.72rem;font-weight:700;letter-spacing:.22em;font-family:var(--font-sans),Arial,sans-serif;
    transition:background-color .3s ease,color .3s ease;}
  .dm-toggle span{position:absolute;inset:0;display:grid;place-items:center;transition:opacity .25s ease;}
  .dm-toggle-close{opacity:0;}
  .dm-toggle[aria-expanded="true"] .dm-toggle-open{opacity:0;}
  .dm-toggle[aria-expanded="true"] .dm-toggle-close{opacity:1;transition-delay:.25s;}

  .dm-menu{position:fixed;inset:0;z-index:0;isolation:isolate;padding:6.5rem 2.5rem 2.5rem;display:flex;gap:2rem;color:#14130f;pointer-events:none;overflow:hidden;
    font-family:var(--font-sans),"Helvetica Neue",Arial,sans-serif;-webkit-user-select:none;user-select:none;}
  .dm-menu.is-open{pointer-events:all;}
  .dm-bg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;}
  .dm-col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;min-width:0;}
  .dm-info .dm-kicker{text-transform:uppercase;font-size:.7rem;font-weight:700;letter-spacing:.25em;color:var(--brand-sampled,#2F5233);margin:0 0 1rem;}
  .dm-info .dm-lg{font-family:var(--font-display),Arial,sans-serif;font-weight:600;letter-spacing:-.03em;font-size:clamp(1.15rem,2.3vw,2.2rem);line-height:1.3;margin:0;overflow-wrap:anywhere;}
  .dm-info .dm-lg a{color:inherit;text-decoration:none;}
  .dm-info .dm-sm{font-weight:400;font-size:clamp(1rem,1.25vw,1.3rem);line-height:1.3;margin:0;color:#4a4438;}
  .dm-info .dm-gap{height:1.2rem;}
  .dm-info .dm-kicker,.dm-info .dm-lg,.dm-info .dm-sm{opacity:0;transform:translateY(100px);transition:opacity .6s ease, transform .75s cubic-bezier(.16,1,.3,1);}
  .dm-menu.is-open .dm-info .dm-kicker{transition-delay:.5s;}
  .dm-menu.is-open .dm-info .dm-lg:nth-of-type(2){transition-delay:.57s;}
  .dm-menu.is-open .dm-info .dm-lg:nth-of-type(3){transition-delay:.64s;}
  .dm-menu.is-open .dm-info .dm-sm:nth-of-type(4){transition-delay:.71s;}
  .dm-menu.is-open .dm-info .dm-sm:nth-of-type(5){transition-delay:.78s;}
  .dm-menu.is-open .dm-info .dm-kicker,.dm-menu.is-open .dm-info .dm-lg,.dm-menu.is-open .dm-info .dm-sm{opacity:1;transform:translateY(0);}
  .dm-links{align-items:flex-end;}
  .dm-links a{text-decoration:none;color:#14130f;font-family:var(--font-display),Arial,sans-serif;font-weight:800;letter-spacing:-.05em;
    font-size:clamp(2.3rem,5vw,4.8rem);line-height:1.18;display:block;width:max-content;max-width:100%;}
  .dm-links a:hover .dm-char,.dm-links a:focus-visible .dm-char{color:var(--brand-sampled,#2F5233);}
  .dm-char{display:inline-block;white-space:pre;transform:translateX(760%);opacity:0;transition:transform 1.15s cubic-bezier(.2,1.35,.28,1), opacity .55s ease, color .25s ease;}
  .dm-menu.is-open .dm-char{transform:translateX(0);opacity:1;}
  @media (max-width:1000px){ .dm-menu{flex-direction:column-reverse;padding:6rem 1.5rem 2rem;gap:1.5rem;} .dm-links{flex:1.5;align-items:flex-start;} .dm-col{flex:none;} .dm-links{justify-content:flex-start;} }
  @media (prefers-reduced-motion: reduce){ .dm-char,.dm-info .dm-kicker,.dm-info .dm-lg,.dm-info .dm-sm{transition-duration:1ms !important;transition-delay:0s !important;} }
`;

/** The "Menu / Close" toggle — sits in the header bar, so it can never collide with the logo or the CTA. */
export function DrapeToggle({
  open,
  onToggle,
  light,
  buttonRef,
}: {
  open: boolean;
  onToggle: () => void;
  light: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="site-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className={`dm-toggle ${
        open ? "bg-charcoal text-white" : light ? "bg-white/15 text-white ring-1 ring-white/30 backdrop-blur" : "bg-charcoal text-white"
      }`}
    >
      <span className="dm-toggle-open" aria-hidden>
        Menu
      </span>
      <span className="dm-toggle-close" aria-hidden>
        Close
      </span>
    </button>
  );
}

/** Full-screen cream drape with the contact column and the staggered link letters. */
export function DrapeOverlay({ open, onNavigate, onSettled }: { open: boolean; onNavigate: () => void; onSettled: () => void }) {
  const pathRef = useRef<SVGPathElement>(null);
  const animRef = useRef(0);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const el = pathRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cancelAnimationFrame(animRef.current);
    if (reduce) {
      el?.setAttribute("d", open ? FULL : HIDDEN);
      onSettled();
    } else {
      const start = performance.now();
      const step = (now: number) => {
        const t = clamp01((now - start) / MORPH_MS);
        el?.setAttribute("d", open ? openPath(t) : closePath(t));
        if (t < 1) animRef.current = requestAnimationFrame(step);
        else {
          if (!open) el?.setAttribute("d", HIDDEN);
          onSettled();
        }
      };
      animRef.current = requestAnimationFrame(step);
    }
    if (open) {
      const id = window.setTimeout(() => firstLink.current?.focus({ preventScroll: true }), reduce ? 0 : 500);
      return () => window.clearTimeout(id);
    }
  }, [open, onSettled]);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  let charIndex = 0;
  return (
    <div id="site-menu" className={`dm-menu${open ? " is-open" : ""}`} inert={!open} aria-hidden={!open}>
      <style>{css}</style>
      <svg className="dm-bg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <path ref={pathRef} d={HIDDEN} fill="#F7F4EE" />
      </svg>

      <div className="dm-col dm-info">
        <p className="dm-kicker">Get in touch</p>
        <p className="dm-lg">
          <a href={`mailto:${business.email}`}>{business.email}</a>
        </p>
        <p className="dm-lg">
          <a href={business.phoneHref}>{business.phone}</a>
        </p>
        <div className="dm-gap" />
        <p className="dm-sm">Comprehensive Irrigation</p>
        <p className="dm-sm">Central Florida · Mon–Fri 7–5, Sat 7–3</p>
      </div>

      <nav className="dm-col dm-links" aria-label="Site menu">
        {LINKS.map((link, n) => (
          <Link key={link.label} ref={n === 0 ? firstLink : undefined} href={link.href} onClick={onNavigate} aria-label={link.label}>
            {link.label.split("").map((ch, i) => {
              const delay = 0.45 + charIndex++ * 0.012;
              return (
                <span key={i} className="dm-char" style={{ transitionDelay: open ? `${delay}s` : "0s" }} aria-hidden>
                  {ch}
                </span>
              );
            })}
          </Link>
        ))}
      </nav>
    </div>
  );
}
