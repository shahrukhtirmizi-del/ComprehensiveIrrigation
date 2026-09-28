"use client";

import React, { useLayoutEffect, useRef } from "react";

type Triple = [string, string, string];

export interface SplitRevealHeroProps {
  studio?: string;
  numeral?: string;
  logo?: string;
  cardTitle?: string;
  tags?: Triple;
  heroImage?: string;
  heroAlt?: string;
  menuLabel?: string;
  /** The site's floating header already carries the logo and a working Menu, so the in-hero nav is opt-in. */
  showNav?: boolean;
  footerLeft?: string;
  footerRight?: string;
  className?: string;
}

const splitChars = (text: string, markFirst = false) =>
  Array.from(text).map((char, index) => (
    <span className={`sf-char${markFirst && index === 0 ? " sf-first" : ""}`} key={`${char}-${index}`}>
      <span>{char === " " ? " " : char}</span>
    </span>
  ));

// Card title: letters animate individually, but each word stays unbreakable so lines only wrap between words.
const splitWordChars = (text: string) =>
  text.split(" ").map((word, w, words) => (
    <React.Fragment key={`${word}-${w}`}>
      <span className="sf-wordwrap">{splitChars(word)}</span>
      {w < words.length - 1 ? " " : null}
    </React.Fragment>
  ));

const splitWords = (text: string) => {
  const words = text.split(" ");
  return words.map((word, index) => (
    <span className="sf-word" key={`${word}-${index}`}>
      {word}
      {index < words.length - 1 ? " " : ""}
    </span>
  ));
};

// Decorative, so the cover text is a <p>, not a heading: the card below holds the page's only <h1>.
const Cover = ({ position, studio, numeral }: { position: "top" | "bottom"; studio: string; numeral: string }) => (
  <div className={`sf-cover sf-${position}`} aria-hidden="true">
    <div className="sf-intro">
      <p className="sf-display">{splitChars(studio, true)}</p>
    </div>
    <div className="sf-number">
      <p className="sf-display">{splitChars(numeral)}</p>
    </div>
  </div>
);

/**
 * Cover-reveal intro: two panels show the studio name, which folds into the numeral; the panels then
 * split to open onto the hero image, and a card reveals the title. Web Animations API only, runs once
 * on load, and shows the settled end state straight away for reduced-motion visitors.
 */
export default function SplitRevealHero({
  studio = "Comprehensive Irrigation",
  numeral = "24",
  logo = "CI",
  cardTitle = "Comprehensive Irrigation",
  tags = ["Smart Irrigation", "Lawn Care", "Water Conservation"],
  heroImage = "/images/hero-lawn.jpg",
  heroAlt = "A healthy, freshly irrigated lawn in Central Florida",
  menuLabel = "Menu",
  showNav = false,
  footerLeft = "Scroll Down",
  footerRight = "Licensed & Insured",
  className = "",
}: SplitRevealHeroProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animations: Animation[] = [];
    const timers: number[] = [];
    let frame = 0;
    let cancelled = false;

    const mobile = root.clientWidth <= 1000;
    const ease = "cubic-bezier(.8,0,.3,1)";
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    const select = <T extends Element = HTMLElement,>(selector: string) => Array.from(root.querySelectorAll<T>(selector));

    const animate = (targets: Element | Element[], frames: Keyframe[], options: KeyframeAnimationOptions) => {
      const elements = Array.isArray(targets) ? targets : [targets];
      elements.forEach((element) => {
        animations.push(element.animate(frames, { fill: "forwards", ...options }));
      });
    };

    const later = (delay: number, callback: () => void) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) callback();
        }, delay),
      );
    };

    const covers = select<HTMLElement>(".sf-cover");
    const tagsLayer = root.querySelector<HTMLElement>(".sf-tags");
    const scene = root.querySelector<HTMLElement>(".sf-scene");
    const card = root.querySelector<HTMLElement>(".sf-card");

    const hideCovers = () => {
      covers.forEach((cover) => {
        cover.style.display = "none";
      });
      if (tagsLayer) tagsLayer.style.display = "none";
      root.dataset.revealed = "true";
    };

    if (reducedMotion) {
      hideCovers();
      if (scene) scene.style.clipPath = "inset(0)";
      if (card) card.style.clipPath = "inset(0)";
      select<HTMLElement>(".sf-card .sf-char > span").forEach((character) => {
        character.style.transform = "translate3d(0,0,0)";
      });
      return;
    }

    const startTimeline = () => {
      if (cancelled) return;

      const introCharacters = select(".sf-cover .sf-intro .sf-char > span");
      const remainingIntroCharacters = select(".sf-cover .sf-intro .sf-char:not(.sf-first) > span");
      const firstCharacters = select(".sf-cover .sf-intro .sf-first");
      const numeralCharacters = select(".sf-cover .sf-number .sf-char");
      const numeralInnerCharacters = select(".sf-cover .sf-number .sf-char > span");
      const tagWords = select(".sf-tag .sf-word");
      const cardCharacters = select(".sf-card .sf-char > span");
      const topCover = root.querySelector<HTMLElement>(".sf-top");
      const bottomCover = root.querySelector<HTMLElement>(".sf-bottom");

      // Where the first letter has to travel to land just left of the grown numeral. Measured rather than
      // hard-coded, so a long studio name like "Comprehensive Irrigation" still lands in the right place.
      const numeralShift = (mobile ? -3 : -8) * rem;
      const numeralFinalFont = (mobile ? 6 : 14) * rem;
      const firstBox = root.querySelector(".sf-top .sf-first")?.getBoundingClientRect();
      const numberText = root.querySelector<HTMLElement>(".sf-top .sf-number .sf-display");
      const numberBox = numberText?.getBoundingClientRect();
      const numberFont = numberText ? parseFloat(getComputedStyle(numberText).fontSize) : numeralFinalFont;
      let firstTravel = (mobile ? 8 : 19) * rem;
      if (firstBox && numberBox) {
        const finalNumberWidth = numberBox.width * (numeralFinalFont / numberFont);
        const numberCenter = numberBox.left + numberBox.width / 2;
        const finalNumberLeft = numberCenter - finalNumberWidth / 2 + numeralShift;
        const gap = numeralFinalFont * 0.06;
        firstTravel = finalNumberLeft - gap - firstBox.width * 0.75 - firstBox.left;
      }
      const firstTravelMid = firstTravel + rem;

      tagWords.forEach((word, index) => {
        animate(word, [{ transform: "translate3d(0,-110%,0)" }, { transform: "translate3d(0,0,0)" }], { duration: 720, delay: 420 + index * 85, easing: ease });
      });

      introCharacters.forEach((character, index) => {
        animate(character, [{ transform: "translate3d(0,-110%,0)" }, { transform: "translate3d(0,0,0)" }], { duration: 720, delay: 420 + index * 45, easing: ease });
      });

      remainingIntroCharacters.forEach((character, index) => {
        animate(character, [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(0,110%,0)" }], { duration: 720, delay: 1920 + index * 45, easing: ease });
      });

      numeralInnerCharacters.forEach((character, index) => {
        animate(character, [{ transform: "translate3d(0,-110%,0)" }, { transform: "translate3d(0,0,0)" }], { duration: 720, delay: 2420 + index * 70, easing: ease });
      });

      firstCharacters.forEach((character) => {
        animate(
          character,
          [
            { transform: "translate3d(0,0,0) scale(1)", fontWeight: 600, offset: 0 },
            { transform: `translate3d(${firstTravelMid}px,0,0) scale(1)`, fontWeight: 600, offset: 0.57 },
            { transform: `translate3d(${firstTravel}px,${mobile ? "-0.15rem" : "-0.35rem"},0) scale(.75)`, fontWeight: 900, offset: 1 },
          ],
          { duration: 1700, delay: 3420, easing: ease },
        );
      });

      numeralCharacters.forEach((character) => {
        animate(
          character,
          [
            { transform: "translate3d(0,0,0)", fontSize: "inherit", fontWeight: 600, offset: 0 },
            { transform: `translate3d(${numeralShift}px,0,0)`, fontSize: "inherit", fontWeight: 600, offset: 0.57 },
            { transform: `translate3d(${numeralShift}px,0,0)`, fontSize: `${numeralFinalFont}px`, fontWeight: 500, offset: 1 },
          ],
          { duration: 1700, delay: 3420, easing: ease },
        );
      });

      later(4920, () => {
        if (topCover) topCover.style.clipPath = "inset(0 0 50% 0)";
        if (bottomCover) bottomCover.style.clipPath = "inset(50% 0 0 0)";
        if (scene) {
          animate(
            scene,
            [{ clipPath: "polygon(0 48%,0 48%,0 52%,0 52%)" }, { clipPath: "polygon(0 48%,100% 48%,100% 52%,0 52%)" }],
            { duration: 980, easing: ease },
          );
        }
      });

      tagWords.forEach((word, index) => {
        animate(word, [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(0,110%,0)" }], { duration: 720, delay: 5420 + index * 85, easing: ease });
      });

      later(5920, () => {
        if (topCover) animate(topCover, [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(0,-50%,0)" }], { duration: 980, easing: ease });
        if (bottomCover) animate(bottomCover, [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(0,50%,0)" }], { duration: 980, easing: ease });
        if (scene) animate(scene, [{ clipPath: "inset(48% 0)" }, { clipPath: "inset(0)" }], { duration: 980, easing: ease });
      });

      later(6170, () => {
        if (card) animate(card, [{ clipPath: "inset(50% 0)" }, { clipPath: "inset(0)" }], { duration: 720, easing: ease });
      });

      cardCharacters.forEach((character, index) => {
        animate(character, [{ transform: "translate3d(0,110%,0)" }, { transform: "translate3d(0,0,0)" }], { duration: 720, delay: 6420 + index * 45, easing: ease });
      });

      // Once everything has landed, drop the covers entirely so nothing sits over the page.
      later(6420 + cardCharacters.length * 45 + 800, hideCovers);
    };

    // Start once the hero font is in, so the measured positions are the real ones.
    const begin = () => {
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(startTimeline);
      });
    };
    if (document.fonts?.status === "loaded") begin();
    else document.fonts.ready.then(() => !cancelled && begin());

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      animations.forEach((animation) => animation.cancel());
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <section ref={rootRef} className={`sf-root ${className}`} aria-labelledby="hero-title">
      <style>{styles}</style>
      <Cover position="bottom" studio={studio} numeral={numeral} />
      <Cover position="top" studio={studio} numeral={numeral} />

      <div className="sf-tags" aria-hidden="true">
        {tags.map((tag, index) => (
          <p className={`sf-tag sf-tag-${index + 1}`} key={tag}>
            {splitWords(tag)}
          </p>
        ))}
      </div>

      <div className="sf-scene">
        {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed hero still, loaded eagerly at high priority */}
        <img className="sf-image" src={heroImage} alt={heroAlt} draggable={false} loading="eager" decoding="async" fetchPriority="high" />
        <div className="sf-shade" />
        {showNav && (
          <div className="sf-nav" aria-hidden="true">
            <strong>{logo}</strong>
            <span>{menuLabel}</span>
          </div>
        )}
        <div className="sf-card">
          <h1 id="hero-title">
            <span aria-hidden="true">{splitWordChars(cardTitle)}</span>
            <span className="sr-only">{cardTitle} — irrigation repair, lawn care and water conservation in Davenport, FL</span>
          </h1>
        </div>
        <div className="sf-footer">
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      </div>
    </section>
  );
}

const styles = `
.sf-root,.sf-root *{box-sizing:border-box;}
.sf-root{position:relative;width:100%;height:100svh;min-height:560px;overflow:hidden;isolation:isolate;background:#1f3d2b;color:#fff;font-family:var(--font-dm-sans),"Helvetica Neue",Arial,sans-serif;}
.sf-root .sf-display,.sf-root h1,.sf-root p{margin:0;text-transform:uppercase;}
.sf-cover,.sf-tags,.sf-scene{position:absolute;inset:0;}
.sf-cover{z-index:4;overflow:hidden;background:#1f3d2b;backface-visibility:hidden;transform:translate3d(0,0,0);will-change:transform,clip-path;contain:layout paint;}
.sf-bottom{z-index:3;} .sf-top{z-index:4;}
.sf-tags{z-index:5;pointer-events:none;}
.sf-intro,.sf-number{position:absolute;top:50%;left:50%;transform:translate3d(-50%,-50%,0);white-space:nowrap;}
.sf-intro{width:100%;text-align:center;}
.sf-number{left:calc(50% + 10rem);}
.sf-intro .sf-display,.sf-number .sf-display{font-size:clamp(1.5rem,6.3vw,6rem);font-weight:600;line-height:1;letter-spacing:-0.02em;}
.sf-char{display:inline-block;overflow:hidden;vertical-align:top;backface-visibility:hidden;will-change:transform,font-size;}
.sf-char > span{display:inline-block;backface-visibility:hidden;will-change:transform;}
.sf-cover .sf-intro .sf-char > span,.sf-cover .sf-number .sf-char > span{transform:translate3d(0,-110%,0);}
.sf-first{transform-origin:top left;}
.sf-tag{position:absolute;width:max-content;overflow:hidden;color:#e9efe3;opacity:.7;font-size:13px;font-weight:500;letter-spacing:.06em;}
.sf-word{display:inline-block;transform:translate3d(0,-110%,0);backface-visibility:hidden;will-change:transform;}
.sf-tag-1{top:15%;left:15%;} .sf-tag-2{bottom:15%;left:25%;} .sf-tag-3{right:15%;bottom:30%;}
.sf-scene{z-index:2;overflow:hidden;clip-path:polygon(0 48%,0 48%,0 52%,0 52%);backface-visibility:hidden;transform:translate3d(0,0,0);will-change:clip-path;contain:layout paint;}
.sf-image,.sf-shade{position:absolute;inset:0;width:100%;height:100%;}
.sf-image{object-fit:cover;transform:translate3d(0,0,0) scale(1.001);backface-visibility:hidden;}
.sf-shade{background:linear-gradient(180deg,rgba(31,61,43,.45),rgba(31,61,43,.06) 45%,rgba(31,61,43,.5));}
.sf-nav,.sf-footer{position:absolute;left:0;z-index:2;display:flex;width:100%;align-items:center;justify-content:space-between;gap:1rem;padding:2rem;text-transform:uppercase;font-size:13px;font-weight:500;letter-spacing:.06em;}
.sf-nav{top:0;} .sf-nav strong{font-size:20px;} .sf-footer{bottom:0;}
.sf-card{position:absolute;top:50%;left:50%;z-index:2;display:flex;width:min(34%,560px);height:60%;align-items:center;justify-content:center;overflow:hidden;transform:translate3d(-50%,-50%,0);background:#f6f2e8;clip-path:inset(50% 0);backface-visibility:hidden;will-change:clip-path;contain:layout paint;padding:1rem;text-align:center;}
.sf-card h1{width:100%;text-align:center;color:#1f3d2b;font-family:var(--font-dm-sans),"Helvetica Neue",Arial,sans-serif;font-size:clamp(1.9rem,3vw,2.7rem);font-weight:600;letter-spacing:-0.02em;line-height:1.05;}
.sf-card .sf-char > span{transform:translate3d(0,110%,0);}
.sf-wordwrap{display:inline-block;white-space:nowrap;}
@media (max-width:1000px){.sf-number{left:calc(50% + 4rem);} .sf-card{width:75%;} .sf-nav,.sf-footer{padding:1.4rem;} .sf-tag-1{left:8%;} .sf-tag-2{left:12%;} .sf-tag-3{right:8%;}}
@media (max-width:560px){.sf-card{width:80%;height:56%;} .sf-card h1{font-size:clamp(1.7rem,9vw,2.4rem);} .sf-footer{padding:1rem;font-size:11px;} .sf-tag{font-size:10px;}}
`;
