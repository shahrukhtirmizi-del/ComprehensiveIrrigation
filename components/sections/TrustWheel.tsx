"use client";

import React, { useEffect, useMemo, useRef } from "react";

const TRUST_WHEEL_STYLES = `
.tw-page { position: relative; width: 100%; min-height: 70vh; overflow: hidden; display: grid; place-items: center;
  background: radial-gradient(circle at 50% 50%, #fdfcf9 0%, #f7f4ee 52%, #efe9dd 100%);
  font-family: var(--font-display), Arial, Helvetica, sans-serif; }
.tw-stage { position: relative; width: min(1700px, 100%); height: 420px; overflow: hidden; display: flex; align-items: center; justify-content: center;
  perspective: 1500px; perspective-origin: 50% 50%; }
.tw-stage::before, .tw-stage::after { content: ""; position: absolute; z-index: 30; top: 0; width: 14%; height: 100%; pointer-events: none; }
.tw-stage::before { left: 0; background: linear-gradient(90deg, #f7f4ee 0%, rgba(247,244,238,0.92) 34%, rgba(247,244,238,0.36) 72%, transparent 100%); }
.tw-stage::after { right: 0; background: linear-gradient(270deg, #f7f4ee 0%, rgba(247,244,238,0.92) 34%, rgba(247,244,238,0.36) 72%, transparent 100%); }
.tw-focus { position: absolute; z-index: 1; left: 50%; top: 50%; width: 620px; height: 220px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(34,38,31,0.05), transparent 68%); transform: translate(-50%, -50%); filter: blur(38px); pointer-events: none; }
.tw-track { position: relative; z-index: 3; width: 100%; height: 100%; transform-style: preserve-3d; }
.tw-word { position: absolute; left: 50%; top: 50%; white-space: nowrap; pointer-events: none; user-select: none;
  transform-style: preserve-3d; will-change: transform, opacity, filter, color;
  font-size: clamp(28px, 3.6vw, 62px); font-weight: 800; line-height: 1; letter-spacing: -0.06em; color: #22261f; }
.tw-caption { position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%); color: rgba(34,38,31,0.42);
  font-family: var(--font-sans), Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; white-space: nowrap; }
@media (max-width: 900px) { .tw-page { min-height: 0; } .tw-stage { height: 340px; } .tw-word { font-size: clamp(20px, 6.2vw, 36px); } }
`;

type TrustWord = { name: string; color: string };

// This business's own trust signals — never another company's name.
const TRUST_WORDS: TrustWord[] = [
  { name: "Licensed", color: "#2F5233" },
  { name: "Insured", color: "#4a6b46" },
  { name: "25+ Years", color: "#C9A876" },
  { name: "Water-Smart", color: "#2F5233" },
  { name: "Grounds Guys Partner", color: "#4a6b46" },
  { name: "Irrigation", color: "#C9A876" },
  { name: "Lawn Care", color: "#2F5233" },
  { name: "Specialized Services", color: "#4a6b46" },
  { name: "Champions Gate", color: "#C9A876" },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) };
};
const mixColor = (from: string, to: string, amount: number) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return `rgb(${Math.round(lerp(a.r, b.r, amount))}, ${Math.round(lerp(a.g, b.g, amount))}, ${Math.round(lerp(a.b, b.b, amount))})`;
};

export default function TrustWheel() {
  const wordRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const words = useMemo(() => TRUST_WORDS, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let previousTime = performance.now();
    let visible = false;

    const place = () => {
      const stageWidth = stageRef.current?.clientWidth || window.innerWidth;
      const isMobile = stageWidth < 900;
      // On narrow screens the orbit is wider than the stage, so the neighbours of the front word sit off-edge instead of overlapping it.
      const radiusX = isMobile ? Math.min(stageWidth * 1.15, 620) : Math.min(stageWidth * 0.56, 860);
      const radiusZ = isMobile ? 390 : 620;
      const verticalArc = isMobile ? 8 : 12;
      const count = words.length;

      wordRefs.current.forEach((element, index) => {
        if (!element) return;
        const angle = (index / count) * Math.PI * 2 - progressRef.current;
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        const frontness = clamp((cos + 1) / 2, 0, 1);
        const focusZone = smoothstep(0.48, 0.96, frontness);
        const sharpness = Math.pow(focusZone, 1.15);
        const x = sin * radiusX;
        const y = -cos * verticalArc + Math.sin(angle * 2) * 4;
        const z = cos * radiusZ;
        const rotateY = -sin * 38;
        const scale = lerp(0.62, 1.14, sharpness);
        const blur = lerp(16, 0, sharpness);
        const opacity = lerp(0.08, 1, Math.pow(frontness, 1.35));
        const colorStrength = smoothstep(0.74, 0.96, frontness);
        const color = mixColor("#22261f", words[index].color, colorStrength);

        element.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
        element.style.opacity = `${opacity}`;
        element.style.filter = `blur(${blur}px) saturate(${lerp(0.9, 1.18, colorStrength)}) contrast(${lerp(0.92, 1.06, sharpness)})`;
        element.style.color = color;
        element.style.zIndex = `${Math.round(1000 + z)}`;
      });
    };

    const animate = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      progressRef.current += delta * 0.28;
      place();
      frameRef.current = visible ? requestAnimationFrame(animate) : null;
    };

    place();
    if (reduce) return;

    // Only spin while the band is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && frameRef.current === null) {
        previousTime = performance.now();
        frameRef.current = requestAnimationFrame(animate);
      }
    });
    if (stageRef.current) io.observe(stageRef.current);
    return () => {
      io.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [words]);

  return (
    <>
      <style>{TRUST_WHEEL_STYLES}</style>
      <section className="tw-page" aria-labelledby="trust-wheel-title">
        <h2 id="trust-wheel-title" className="sr-only">
          Why Central Florida trusts us
        </h2>
        <ul className="sr-only">
          {words.map((w) => (
            <li key={w.name}>{w.name}</li>
          ))}
        </ul>
        <div ref={stageRef} className="tw-stage" aria-hidden>
          <div className="tw-focus" />
          <div className="tw-track">
            {words.map((word, index) => (
              <div
                key={word.name}
                ref={(el) => {
                  wordRefs.current[index] = el;
                }}
                className="tw-word"
                data-word={word.name}
              >
                {word.name}
              </div>
            ))}
          </div>
          <div className="tw-caption">Why Central Florida Trusts Us</div>
        </div>
      </section>
    </>
  );
}
