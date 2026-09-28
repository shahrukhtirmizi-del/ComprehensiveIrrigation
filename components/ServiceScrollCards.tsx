"use client";

import React, { CSSProperties, useEffect, useRef } from "react";

const CSS = `
.kex-scroll-page,.kex-scroll-page *{box-sizing:border-box;}
.kex-scroll-page{width:100%;background:#1f3d2b;font-family:var(--font-inter),"Helvetica Neue",Arial,sans-serif;}
.kex-scroll-scene{position:relative;height:520vh;background:#1f3d2b;}
.kex-sticky-stage{position:sticky;top:0;width:100%;height:100vh;overflow:hidden;background:#1f3d2b;}
.kex-hero-content{position:absolute;inset:0;z-index:1;padding:clamp(24px,4vw,72px);color:#fff;display:flex;flex-direction:column;justify-content:center;}
.kex-hero-title{margin:0;max-width:14ch;font-family:inherit;font-size:clamp(48px,7vw,120px);font-weight:900;line-height:.9;letter-spacing:-.04em;text-transform:uppercase;color:#fff;}
.kex-hero-subtitle{margin:24px 0 0;max-width:520px;font-size:18px;font-weight:400;line-height:1.4;opacity:.8;}
.kex-card-layer{position:absolute;inset:0;z-index:5;pointer-events:none;}
.kex-scroll-card{position:absolute;left:0;top:0;width:100%;height:100vh;background:var(--card-bg);color:var(--card-text);transform-origin:14% 0%;will-change:transform,opacity,filter;overflow:hidden;}
.js .kex-scroll-card{opacity:0;}
.kex-scroll-card::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 18%,rgba(255,255,255,.16),transparent 34%),radial-gradient(circle at 88% 78%,rgba(255,255,255,.08),transparent 38%);opacity:.42;pointer-events:none;}
.kex-card-inner{position:relative;z-index:2;width:100%;height:100%;padding:clamp(38px,4vw,72px);}
.kex-card-kicker{margin:0 0 clamp(80px,14vh,150px);color:var(--card-muted);font-size:clamp(13px,1.2vw,20px);font-weight:850;letter-spacing:.25em;text-transform:uppercase;}
.kex-card-title{margin:0;max-width:12ch;font-family:inherit;font-size:clamp(38px,6vw,88px);font-weight:900;line-height:.95;letter-spacing:-.04em;text-transform:uppercase;color:inherit;}
.kex-card-description{position:absolute;right:clamp(30px,6vw,100px);bottom:clamp(36px,5vw,80px);max-width:44ch;margin:0;color:var(--card-muted);font-size:clamp(17px,1.5vw,24px);line-height:1.4;letter-spacing:-.02em;}
.kex-card-number{position:absolute;right:clamp(28px,4vw,70px);top:clamp(28px,4vw,70px);color:var(--card-number);font-size:clamp(40px,6vw,90px);font-weight:900;letter-spacing:-.06em;}
@media (max-width:800px){.kex-scroll-scene{height:540vh;} .kex-hero-title{font-size:clamp(46px,15vw,84px);} .kex-card-title{font-size:clamp(32px,10vw,80px);} .kex-card-description{left:clamp(38px,4vw,72px);right:auto;bottom:42px;max-width:80%;font-size:17px;}}
@media (prefers-reduced-motion: reduce){
  .kex-scroll-scene{height:auto;}
  .kex-sticky-stage{position:relative;height:auto;overflow:visible;}
  .kex-hero-content{position:relative;inset:auto;min-height:60vh;}
  .kex-card-layer{position:relative;inset:auto;}
  .kex-scroll-card{position:relative;height:auto;min-height:80vh;transform:none !important;opacity:1 !important;filter:none !important;}
  .kex-card-description{position:relative;right:auto;bottom:auto;margin-top:48px;}
}
`;

type Card = { number: string; kicker: string; title: string; description: string; bg: string; text: string; muted: string; numberColor: string };
type CardStyle = CSSProperties & { "--card-bg": string; "--card-text": string; "--card-muted": string; "--card-number": string };

const cards: Card[] = [
  { number: "01", kicker: "01 — Irrigation & Repair", title: "Systems that don't waste a drop", description: "Design, install and repair for sprinkler and drip systems, tuned to your soil and sun.", bg: "#25452f", text: "#ffffff", muted: "rgba(255,255,255,0.72)", numberColor: "rgba(255,255,255,0.22)" },
  { number: "02", kicker: "02 — Lawn Care", title: "Grass that earns the compliments", description: "Mowing, feeding and seasonal treatment programs built around your lawn's actual condition.", bg: "#2e5b3f", text: "#ffffff", muted: "rgba(255,255,255,0.76)", numberColor: "rgba(255,255,255,0.22)" },
  { number: "03", kicker: "03 — Specialized Services", title: "The jobs other crews skip", description: "Drainage, grading and the fixes that stop a problem before it becomes a rebuild.", bg: "#3f7a52", text: "#ffffff", muted: "rgba(255,255,255,0.76)", numberColor: "rgba(255,255,255,0.24)" },
  { number: "04", kicker: "04 — Water Conservation", title: "Smart schedules, lower bills", description: "Controller upgrades and audits that cut water use without cutting results.", bg: "#173321", text: "#ffffff", muted: "rgba(255,255,255,0.76)", numberColor: "rgba(255,255,255,0.24)" },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function ServiceScrollCards() {
  const sceneRef = useRef<HTMLElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const updateTargetProgress = () => {
      const scene = sceneRef.current;
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      targetProgress.current = clamp(-rect.top / Math.max(scrollable, 1), 0, 1);
    };

    let painted = false;
    const render = () => {
      frameRef.current = requestAnimationFrame(render);
      const delta = targetProgress.current - currentProgress.current;
      // Settled: nothing to write this frame.
      if (painted && Math.abs(delta) < 0.00005) return;
      painted = true;
      currentProgress.current += delta * 0.085;
      const progress = currentProgress.current;

      if (heroTitleRef.current) {
        const heroLift = clamp(progress / 0.24, 0, 1);
        heroTitleRef.current.style.transform = `translate3d(0, ${lerp(0, -110, heroLift)}px, 0)`;
        heroTitleRef.current.style.opacity = `${lerp(1, 0.58, heroLift)}`;
      }
      if (heroSubtitleRef.current) {
        const subtitleFade = clamp(progress / 0.16, 0, 1);
        heroSubtitleRef.current.style.transform = `translate3d(0, ${lerp(0, -45, subtitleFade)}px, 0)`;
        heroSubtitleRef.current.style.opacity = `${lerp(1, 0, subtitleFade)}`;
      }
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const start = 0.08 + index * 0.215;
        const end = start + 0.22;
        const raw = clamp((progress - start) / (end - start), 0, 1);
        const eased = easeOutCubic(raw);
        const settle = easeInOutCubic(raw);
        const y = lerp(112, 0, eased);
        const x = lerp(10, 0, eased);
        const rotate = lerp(-7.5, 0, settle);
        const scale = lerp(1.05, 1, eased);
        const opacity = raw <= 0 ? 0 : lerp(0.4, 1, eased);
        const blur = lerp(3, 0, eased);
        card.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotate(${rotate}deg) scale(${scale})`;
        card.style.opacity = `${opacity}`;
        card.style.filter = `blur(${blur}px)`;
        card.style.zIndex = `${20 + index}`;
      });
    };

    updateTargetProgress();
    window.addEventListener("scroll", updateTargetProgress, { passive: true });
    window.addEventListener("resize", updateTargetProgress);
    frameRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener("scroll", updateTargetProgress);
      window.removeEventListener("resize", updateTargetProgress);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="kex-scroll-page">
        <section id="services" ref={sceneRef} className="kex-scroll-scene" aria-labelledby="services-title">
          <div className="kex-sticky-stage">
            <div className="kex-hero-content">
              <h2 id="services-title" ref={heroTitleRef} className="kex-hero-title">
                Our Services
              </h2>
              <p ref={heroSubtitleRef} className="kex-hero-subtitle">
                Four ways we keep your property watered, fed and running right.
              </p>
            </div>
            <div className="kex-card-layer">
              {cards.map((card, index) => {
                const style: CardStyle = { "--card-bg": card.bg, "--card-text": card.text, "--card-muted": card.muted, "--card-number": card.numberColor };
                return (
                  <article
                    key={card.number}
                    ref={(element) => {
                      cardRefs.current[index] = element;
                    }}
                    className="kex-scroll-card"
                    style={style}
                  >
                    <div className="kex-card-inner">
                      <div className="kex-card-number" aria-hidden="true">
                        {card.number}
                      </div>
                      <p className="kex-card-kicker">{card.kicker}</p>
                      <h3 className="kex-card-title">{card.title}</h3>
                      <p className="kex-card-description">{card.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
