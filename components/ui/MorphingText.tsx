"use client";

import { useId, useMemo, type CSSProperties, type ElementType } from "react";

type MorphEase = "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut";

interface MorphingTextProps {
  words?: string | string[];
  color?: string;
  morphDuration?: number;
  holdDuration?: number;
  blurAmount?: number;
  ease?: MorphEase | [number, number, number, number];
  tag?: ElementType;
  className?: string;
  textStyle?: CSSProperties;
  style?: CSSProperties;
}

const easingPresets: Record<MorphEase, string> = {
  linear: "linear",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: "cubic-bezier(0.6, 0.04, 0.98, 0.335)",
  circOut: "cubic-bezier(0.075, 0.82, 0.165, 1)",
  circInOut: "cubic-bezier(0.785, 0.135, 0.15, 0.86)",
  backIn: "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
  backOut: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  backInOut: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

function resolveEasing(ease: MorphingTextProps["ease"]): string {
  if (Array.isArray(ease) && ease.length === 4) return `cubic-bezier(${ease.join(",")})`;
  return easingPresets[(ease as MorphEase) ?? "easeInOut"];
}

function parseWords(words: string | string[]) {
  const source = Array.isArray(words) ? words : words.split(/\r?\n|,/);
  return source.map((word) => word.trim()).filter(Boolean);
}

/** Gooey blur-morph between words: an alpha-threshold SVG filter fuses the cross-fading blurs into one shape. */
export function MorphingText({
  words = ["SAVE WATER", "PROTECT YOUR LAWN", "PREVENT WASTE"],
  color = "#F7F4EE",
  morphDuration = 1,
  holdDuration = 1,
  blurAmount = 20,
  ease = "easeInOut",
  tag: Tag = "div",
  className,
  textStyle,
  style,
}: MorphingTextProps) {
  const generatedId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const animationName = `wordMorph${generatedId}`;
  const filterId = `wordMorphFilter${generatedId}`;
  const wordList = useMemo(() => parseWords(words), [words]);
  const safeWords = wordList.length > 0 ? wordList : ["MORPH"];
  const safeMorphDuration = Math.max(0.1, morphDuration);
  const safeHoldDuration = Math.max(0, holdDuration);
  const safeBlur = Math.max(0, blurAmount);
  const slotDuration = safeMorphDuration + safeHoldDuration;
  const completeCycle = slotDuration * safeWords.length;
  const toPercentage = (seconds: number) => Math.min(100, (seconds / completeCycle) * 100).toFixed(4);
  const morphInEnd = toPercentage(safeMorphDuration);
  const holdEnd = toPercentage(safeMorphDuration + safeHoldDuration);
  const morphOutEnd = toPercentage(safeMorphDuration * 2 + safeHoldDuration);
  const longestWord = safeWords.reduce((longest, current) => (current.length > longest.length ? current : longest), "");
  const timingFunction = resolveEasing(ease);

  const keyframes = `
    @keyframes ${animationName} {
      0% { opacity: 0; filter: blur(${safeBlur}px); transform: translate3d(-50%, -50%, 0) scale(0.8); }
      ${morphInEnd}% { opacity: 1; filter: blur(0); transform: translate3d(-50%, -50%, 0) scale(1); }
      ${holdEnd}% { opacity: 1; filter: blur(0); transform: translate3d(-50%, -50%, 0) scale(1); }
      ${morphOutEnd}%, 100% { opacity: 0; filter: blur(${safeBlur}px); transform: translate3d(-50%, -50%, 0) scale(1.2); }
    }
    @media (prefers-reduced-motion: reduce) {
      .${animationName}-word { animation: none !important; opacity: 0 !important; }
      .${animationName}-word:first-of-type { opacity: 1 !important; filter: none !important; transform: translate3d(-50%, -50%, 0) !important; }
    }
  `;

  const typography: CSSProperties = {
    fontFamily: "var(--font-sans), Arial, Helvetica, sans-serif",
    fontSize: "clamp(40px, 9vw, 120px)",
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    textAlign: "center",
    textTransform: "uppercase",
    ...textStyle,
  };

  return (
    <Tag
      className={className}
      aria-label={safeWords.join(", ")}
      style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", userSelect: "none", ...style }}
    >
      <style>{keyframes}</style>
      <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 25 -9" result="morphedAlpha" />
            <feComposite in="SourceGraphic" in2="morphedAlpha" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div
        aria-hidden="true"
        style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", filter: `url(#${filterId})`, ...typography }}
      >
        <span style={{ visibility: "hidden", display: "inline-block", whiteSpace: "nowrap" }}>{longestWord}</span>
        {safeWords.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={`${animationName}-word`}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              color,
              opacity: 0,
              whiteSpace: "nowrap",
              animationName,
              animationDuration: `${completeCycle}s`,
              animationDelay: `${(slotDuration * index).toFixed(3)}s`,
              animationTimingFunction: timingFunction,
              animationIterationCount: "infinite",
              animationFillMode: "both",
              willChange: "opacity, filter, transform",
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </Tag>
  );
}
