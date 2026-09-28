"use client";

import { useEffect, useId, useMemo, useRef, type CSSProperties, type ReactNode } from "react";

type GradientStop = { offset: number; color: string };

const VIEW_WIDTH = 1440;
const VIEW_HEIGHT = 620;

const GRADIENT_STOPS: GradientStop[] = [
  { offset: 0, color: "#0d150f" },
  { offset: 0.17, color: "#2e5b3f" },
  { offset: 0.34, color: "#7fd99a" },
  { offset: 0.5, color: "#e9efe3" },
  { offset: 0.66, color: "#c9a876" },
  { offset: 0.82, color: "#8f6b3f" },
  { offset: 1, color: "#8f6b3f00" },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function createGlowProfile(count: number, peak: number, edgeHeight: number) {
  return Array.from({ length: count }, (_, index) => {
    const position = count === 1 ? 0.5 : index / (count - 1);
    const distance = Math.abs(position - 0.5) * 2;
    const dome = Math.cos((distance * Math.PI) / 2);
    const curve = Math.pow(Math.max(0, dome), 0.72);
    const variation = 0.97 + Math.cos(index * 1.9) * 0.03;
    return VIEW_HEIGHT * peak * (edgeHeight + (1 - edgeHeight) * curve) * variation;
  });
}

interface ChromaticFooterProps {
  children: ReactNode;
  glowHeight?: string;
  restingScale?: number;
  columns?: number;
  blur?: number;
  className?: string;
  style?: CSSProperties;
}

/** Footer whose chromatic glow rises from the bottom edge of the screen as the page reaches its end. */
export function ChromaticFooter({
  children,
  glowHeight = "clamp(270px, 44svh, 520px)",
  restingScale = 0.035,
  columns = 11,
  blur = 20,
  className,
  style,
}: ChromaticFooterProps) {
  const id = useId().replace(/:/g, "");
  const glowRef = useRef<HTMLDivElement>(null);
  const safeColumns = Math.max(3, Math.floor(columns));
  const columnWidth = VIEW_WIDTH / safeColumns;
  const profile = useMemo(() => createGlowProfile(safeColumns, 0.98, 0.42), [safeColumns]);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    const doc = glow.ownerDocument;
    const win = doc.defaultView ?? window;
    const reducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const updateGlow = () => {
      animationFrame = 0;
      if (reducedMotion.matches) {
        glow.style.transform = "translateZ(0) scaleY(1)";
        return;
      }
      const scrollingElement = doc.scrollingElement ?? doc.documentElement;
      const glowHeightPixels = glow.offsetHeight || 1;
      const scrollTop = win.scrollY || scrollingElement.scrollTop;
      const maxScroll = Math.max(0, scrollingElement.scrollHeight - win.innerHeight);
      const remainingScroll = Math.max(0, maxScroll - scrollTop);
      const reveal = clamp((glowHeightPixels - remainingScroll) / glowHeightPixels);
      const scale = clamp(restingScale) + (1 - clamp(restingScale)) * reveal;
      glow.style.transform = `translateZ(0) scaleY(${scale})`;
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = win.requestAnimationFrame(updateGlow);
    };

    scheduleUpdate();
    win.addEventListener("scroll", scheduleUpdate, { passive: true });
    win.addEventListener("resize", scheduleUpdate, { passive: true });
    reducedMotion.addEventListener?.("change", scheduleUpdate);

    return () => {
      if (animationFrame) win.cancelAnimationFrame(animationFrame);
      win.removeEventListener("scroll", scheduleUpdate);
      win.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener?.("change", scheduleUpdate);
    };
  }, [restingScale]);

  return (
    <footer className={className} style={{ position: "relative", isolation: "isolate", paddingBottom: glowHeight, ...style }}>
      <div className="relative z-10">{children}</div>
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0"
        style={{
          height: glowHeight,
          transform: `translateZ(0) scaleY(${clamp(restingScale)})`,
          transformOrigin: "bottom center",
          willChange: "transform",
        }}
      >
        <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="block size-full">
          <defs>
            <linearGradient id={`gradient-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1={VIEW_HEIGHT} x2="0" y2="0">
              {GRADIENT_STOPS.map((stop, index) => (
                <stop key={index} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
            <filter id={`blur-${id}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          </defs>
          <g filter={`url(#blur-${id})`}>
            {profile.map((height, index) => (
              <rect
                key={index}
                x={index * columnWidth - columnWidth * 0.09}
                y={VIEW_HEIGHT - height}
                width={columnWidth * 1.18}
                height={height + blur}
                rx={columnWidth * 0.24}
                fill={`url(#gradient-${id})`}
              />
            ))}
          </g>
        </svg>
      </div>
    </footer>
  );
}

export default ChromaticFooter;
