"use client";

import React, { useEffect, useMemo, useRef } from "react";

const STYLES = `
.ciw-wheel-page, .ciw-wheel-page * { box-sizing: border-box; }
.ciw-wheel-page { position: relative; width: 100%; min-height: 70vh; overflow: hidden; display: grid; place-items: center; background: #f6f2e8; font-family: var(--font-inter), "Helvetica Neue", Arial, sans-serif; }
.ciw-wheel-stage { position: relative; width: min(1700px, 100%); height: 420px; overflow: hidden; display: flex; align-items: center; justify-content: center; perspective: 1500px; perspective-origin: 50% 50%; }
.ciw-wheel-stage::before, .ciw-wheel-stage::after { content: ""; position: absolute; z-index: 30; top: 0; width: 14%; height: 100%; pointer-events: none; }
.ciw-wheel-stage::before { left: 0; background: linear-gradient(90deg, #f6f2e8 0%, rgba(246,242,232,0.92) 34%, rgba(246,242,232,0.36) 72%, transparent 100%); }
.ciw-wheel-stage::after { right: 0; background: linear-gradient(270deg, #f6f2e8 0%, rgba(246,242,232,0.92) 34%, rgba(246,242,232,0.36) 72%, transparent 100%); }
.ciw-wheel-focus { position: absolute; z-index: 1; left: 50%; top: 50%; width: 620px; height: 220px; border-radius: 50%; background: radial-gradient(ellipse, rgba(31,61,43,0.06), transparent 68%); transform: translate(-50%, -50%); filter: blur(38px); pointer-events: none; }
.ciw-wheel-track { position: relative; z-index: 3; width: 100%; height: 100%; transform-style: preserve-3d; margin: 0; padding: 0; list-style: none; }
.ciw-word { position: absolute; left: 50%; top: 50%; white-space: nowrap; pointer-events: none; user-select: none; transform-style: preserve-3d; will-change: transform, opacity, filter, color; font-size: clamp(34px, 4.2vw, 74px); font-weight: 950; line-height: 1; letter-spacing: -0.06em; text-transform: uppercase; color: #1f3d2b; }
.ciw-word::after { content: attr(data-word); position: absolute; left: 0; top: 78%; width: 100%; opacity: var(--reflection-opacity); color: currentColor; transform: scaleY(-0.24) translateY(14px); transform-origin: top; filter: blur(20px); pointer-events: none; }
.ciw-caption { position: absolute; left: 50%; bottom: 24px; margin: 0; transform: translateX(-50%); white-space: nowrap; color: rgba(31,61,43,0.5); font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; }
@media (max-width: 900px) { .ciw-wheel-stage { height: 340px; } .ciw-wheel-stage::before, .ciw-wheel-stage::after { width: 10%; } .ciw-word { font-size: clamp(26px, 8vw, 48px); } }
@media (max-width: 640px) { .ciw-wheel-stage { height: 300px; } .ciw-word { font-size: clamp(22px, 7vw, 38px); } }
`;

type Item = { name: string; color: string };

const ITEMS: Item[] = [
  { name: "Irrigation", color: "#2e5b3f" },
  { name: "Lawn Care", color: "#3f7a52" },
  { name: "Drainage", color: "#1f3d2b" },
  { name: "Water Savings", color: "#7fd99a" },
  { name: "Licensed", color: "#c9a876" },
  { name: "Insured", color: "#2e5b3f" },
  { name: "Smart Controls", color: "#3f7a52" },
  { name: "Local Crew", color: "#8f6b3f" },
];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const hexToRgb = (hex: string) => {
  const c = hex.replace("#", "");
  return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) };
};
const mixColor = (from: string, to: string, amount: number) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return `rgb(${Math.round(lerp(a.r, b.r, amount))}, ${Math.round(lerp(a.g, b.g, amount))}, ${Math.round(lerp(a.b, b.b, amount))})`;
};

export default function TrustWordWheel() {
  const wordRefs = useRef<Array<HTMLLIElement | null>>([]);
  const stageRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const items = useMemo(() => ITEMS, []);

  useEffect(() => {
    const stage = stageRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = () => {
      const stageWidth = stage?.clientWidth || window.innerWidth;
      const isMobile = stageWidth < 900;
      const radiusX = isMobile ? Math.min(stageWidth * 0.78, 560) : Math.min(stageWidth * 0.56, 860);
      const radiusZ = isMobile ? 390 : 620;
      const verticalArc = isMobile ? 8 : 12;
      const count = items.length;

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
        const color = mixColor("#1f3d2b", items[index].color, colorStrength);
        const reflectionOpacity = lerp(0.01, 0.1, colorStrength);

        element.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
        element.style.opacity = `${opacity}`;
        element.style.filter = `blur(${blur}px) saturate(${lerp(0.9, 1.18, colorStrength)}) contrast(${lerp(0.92, 1.06, sharpness)})`;
        element.style.color = color;
        element.style.textShadow = `0 10px 30px rgba(31,61,43,${lerp(0.02, 0.12, sharpness)}), 0 0 ${lerp(0, 24, colorStrength)}px rgba(31,61,43,${lerp(0, 0.055, colorStrength)})`;
        element.style.setProperty("--reflection-opacity", `${reflectionOpacity}`);
        element.style.zIndex = `${Math.round(1000 + z)}`;
      });
    };

    // Reduced motion: one still frame, repainted only when the layout changes.
    if (reduce) {
      paint();
      window.addEventListener("resize", paint);
      return () => window.removeEventListener("resize", paint);
    }

    let previousTime = performance.now();
    const animate = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      progressRef.current += delta * 0.28;
      paint();
      frameRef.current = requestAnimationFrame(animate);
    };
    const play = () => {
      if (frameRef.current !== null) return;
      previousTime = performance.now();
      frameRef.current = requestAnimationFrame(animate);
    };
    const pause = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };

    paint();
    // Only spin while the wheel is on screen.
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()));
    if (stage) io.observe(stage);
    else play();

    return () => {
      io.disconnect();
      pause();
    };
  }, [items]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="ciw-wheel-page">
        <section ref={stageRef} className="ciw-wheel-stage" aria-label="What we bring to every job">
          <div className="ciw-wheel-focus" />
          <ul className="ciw-wheel-track">
            {items.map((item, index) => (
              <li
                key={item.name}
                ref={(el) => {
                  wordRefs.current[index] = el;
                }}
                className="ciw-word"
                data-word={item.name}
              >
                {item.name}
              </li>
            ))}
          </ul>
          <p className="ciw-caption" aria-hidden="true">
            What we bring to every job
          </p>
        </section>
      </div>
    </>
  );
}
