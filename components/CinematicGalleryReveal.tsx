"use client";

import Image from "next/image";
import Lenis from "lenis";
import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ArrowButton } from "@/components/ArrowButton";

export interface CinematicGalleryRevealProps {
  images?: string[];
  brand?: string;
  heading?: string;
  buttonLabel?: string;
  buttonHref?: string;
  footerText?: string;
  showcaseHeading?: string;
  contactHeading?: string;
  /**
   * true  → runs inside its own scroll container with its own Lenis instance.
   * false → rides the page's shared Lenis (components/providers/SmoothScroll); never creates a second one.
   */
  embedded?: boolean;
}

const DEFAULT_IMAGES = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
  "/images/gallery-7.jpg",
  "/images/gallery-8.jpg",
  "/images/gallery-9.jpg",
];

const clampProgress = (value: number, start: number, end: number) => gsap.utils.clamp(0, 1, (value - start) / (end - start));
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

export default function CinematicGalleryReveal({
  images,
  brand = "CI",
  heading = "Every repair, adjustment and schedule we set is measured against one question: is this water doing its job?",
  buttonLabel = "See Our Work",
  buttonHref = "/#work",
  footerText = "Irrigation, lawn care and water-smart systems",
  showcaseHeading = "The New Standard",
  contactHeading = "Ready For Healthier Grass?",
  embedded = false,
}: CinematicGalleryRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const galleryImages = useMemo(() => {
    const customImages = images?.filter(Boolean).slice(0, 9) ?? [];
    return [...customImages, ...DEFAULT_IMAGES.slice(customImages.length)].slice(0, 9);
  }, [images]);

  const headingWords = useMemo(() => heading.trim().split(/\s+/), [heading]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const content = root.querySelector<HTMLElement>(".cgr-content");
    const hero = root.querySelector<HTMLElement>(".cgr-hero");
    const heroInner = root.querySelector<HTMLElement>(".cgr-hero-inner");
    const gallery = root.querySelector<HTMLElement>(".cgr-gallery");
    const mark = root.querySelector<HTMLElement>(".cgr-mark");
    const footer = root.querySelector<HTMLElement>(".cgr-footer");
    const button = root.querySelector<HTMLElement>(".cgr-button");
    const overlay = root.querySelector<HTMLElement>(".cgr-overlay");
    const imageElements = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".cgr-card img"));
    const wordElements = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".cgr-word"));

    if (!content || !hero || !heroInner || !gallery || !mark || !footer || !button || !overlay) return;

    let lenis: Lenis | null = null;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let heroTrigger: ScrollTrigger | null = null;

    const context = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        gsap.set(gallery, { scale: 0.52 });
        gsap.set(imageElements, { scale: 1 });
        gsap.set([...wordElements, button], { opacity: 1, y: 0 });
        gsap.set(footer, { opacity: 0 });
        gsap.set(mark, { scale: 1 });
        return;
      }

      const scroller = embedded ? root : undefined;
      const getViewportHeight = () => (embedded ? root.clientHeight : window.innerHeight);
      let startingMarkScale = window.innerWidth <= 900 ? 2.2 : 5.7;

      gsap.set([...wordElements, button], { opacity: 0, y: 14 });

      if (embedded) {
        lenis = new Lenis({ wrapper: root, content, lerp: 0.08, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        const updateSmoothScroll = (time: number) => {
          lenis?.raf(time);
          animationFrame = requestAnimationFrame(updateSmoothScroll);
        };
        animationFrame = requestAnimationFrame(updateSmoothScroll);
      }

      heroTrigger = ScrollTrigger.create({
        trigger: hero,
        scroller,
        start: "top top",
        end: () => `+=${getViewportHeight() * 3.7}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => {
          startingMarkScale = window.innerWidth <= 900 ? 2.2 : 5.7;
        },
        onUpdate: ({ progress }) => {
          const viewportHeight = getViewportHeight();
          const galleryProgress = clampProgress(progress, 0, 0.7);
          gsap.set(gallery, { scale: mix(1, 0.52, galleryProgress) });
          gsap.set(imageElements, { scale: mix(1.28, 1, galleryProgress) });
          const markScale = mix(startingMarkScale, 1, galleryProgress);
          const markTravel = viewportHeight - mark.offsetHeight - 48;
          gsap.set(mark, { scale: markScale, y: -markTravel * galleryProgress });
          const footerProgress = clampProgress(progress, 0.04, 0.24);
          gsap.set(footer, {
            opacity: mix(1, 0, footerProgress),
            scale: mix(1, 0.78, footerProgress),
            filter: `blur(${mix(0, 18, footerProgress)}px)`,
          });
          const revealItems = [...wordElements, button];
          const revealStart = 0.13;
          const revealEnd = 0.62;
          const revealSpacing = (revealEnd - revealStart) / Math.max(revealItems.length, 1);
          revealItems.forEach((element, index) => {
            const itemStart = revealStart + revealSpacing * index;
            const itemProgress = clampProgress(progress, itemStart, itemStart + revealSpacing * 3);
            gsap.set(element, { opacity: itemProgress, y: mix(14, 0, itemProgress) });
          });
          const handoffProgress = clampProgress(progress, 0.78, 1);
          gsap.set(heroInner, { yPercent: mix(0, -24, handoffProgress), scale: mix(1, 0.96, handoffProgress) });
          gsap.set(overlay, { opacity: mix(0, 0.94, handoffProgress) });
        },
      });

      resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      resizeObserver.observe(root);
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, root);

    return () => {
      heroTrigger?.kill();
      resizeObserver?.disconnect();
      cancelAnimationFrame(animationFrame);
      lenis?.destroy();
      context.revert();
    };
  }, [embedded, galleryImages]);

  const columns = [galleryImages.slice(0, 3), galleryImages.slice(3, 6), galleryImages.slice(6, 9)];

  return (
    <div ref={rootRef} className={`cgr-root ${embedded ? "cgr-embedded" : ""}`}>
      <style>{styles}</style>
      <div className="cgr-content">
        <section className="cgr-hero" aria-labelledby="cgr-heading">
          <div className="cgr-hero-inner">
            <div className="cgr-gallery" aria-hidden="true">
              {columns.map((column, columnIndex) => (
                <div className="cgr-column" key={`column-${columnIndex}`}>
                  {column.map((source, imageIndex) => {
                    const globalIndex = columnIndex * 3 + imageIndex;
                    return (
                      <figure className="cgr-card" key={`${source}-${globalIndex}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- scaled every frame by GSAP; the optimizer's wrapper would fight it */}
                        <img src={source} alt="" draggable={false} loading={globalIndex < 3 ? "eager" : "lazy"} decoding="async" />
                        <span className="cgr-card-shine" />
                      </figure>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="cgr-mark" aria-hidden="true">
              {brand}
            </div>
            <div className="cgr-copy">
              <p className="cgr-kicker">Comprehensive Irrigation</p>
              <h2 id="cgr-heading">
                {headingWords.map((word, index) => (
                  <span className="cgr-word" key={`${word}-${index}`}>
                    {word}
                  </span>
                ))}
              </h2>
              <div className="cgr-button">
                <ArrowButton href={buttonHref} light>
                  {buttonLabel}
                </ArrowButton>
              </div>
            </div>
            <p className="cgr-footer">{footerText}</p>
          </div>
          <div className="cgr-overlay" />
        </section>
        <section className="cgr-showcase" id="cgr-showcase" aria-labelledby="cgr-showcase-title">
          <div className="cgr-bg" aria-hidden="true">
            <Image src="/images/work-pool-backyard-sunset.jpg" alt="" fill sizes="100vw" quality={70} />
          </div>
          <p className="cgr-section-label">Selected stories</p>
          <h2 id="cgr-showcase-title">{showcaseHeading}</h2>
          <p className="cgr-section-description">
            An evolving record of yards, systems and schedules built for how your property actually grows.
          </p>
        </section>
        <section className="cgr-contact" id="cgr-contact" aria-labelledby="cgr-contact-title">
          <div className="cgr-bg" aria-hidden="true">
            <Image src="/images/hero-sprinkler-golden-hour.jpg" alt="" fill sizes="100vw" quality={70} />
          </div>
          <p className="cgr-section-label">New collaborations</p>
          <h2 id="cgr-contact-title">{contactHeading}</h2>
          <div className="cgr-contact-cta">
            <ArrowButton href="/#quote" light>
              Get a free quote
            </ArrowButton>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = `
.cgr-root{position:relative;width:100%;color:#fff;background:#1f3d2b;font-family:var(--font-inter),"Helvetica Neue",Arial,sans-serif;}
.cgr-root,.cgr-root *{box-sizing:border-box;}
.cgr-root :is(h1,h2,p,figure){margin:0;padding:0;}
.cgr-root.cgr-embedded{height:100svh;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;}
.cgr-root.cgr-embedded::-webkit-scrollbar{display:none;}
.cgr-content{position:relative;width:100%;}
.cgr-root section{position:relative;width:100%;min-height:100svh;overflow:hidden;}
.cgr-hero{height:100svh;background:#1f3d2b;}
.cgr-hero-inner{position:relative;width:100%;height:100%;overflow:hidden;transform-origin:center top;will-change:transform;}
.cgr-gallery{position:absolute;top:50%;left:50%;display:flex;width:calc(300% + 2rem);height:calc(300svh + 2rem);gap:1rem;transform:translate(-50%,-50%);transform-origin:center;will-change:transform;}
.cgr-column{display:flex;flex:1;flex-direction:column;min-width:0;gap:1rem;}
.cgr-card{position:relative;flex:1;min-height:0;overflow:hidden;background:#2e5b3f;isolation:isolate;}
.cgr-card img{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.28);filter:saturate(1.05) contrast(1.03);user-select:none;will-change:transform;}
.cgr-card::before{position:absolute;inset:0;z-index:1;content:"";pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.06),transparent 35%,rgba(31,61,43,.32));}
.cgr-card::after{position:absolute;inset:0;z-index:2;content:"";pointer-events:none;opacity:.16;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");mix-blend-mode:soft-light;}
.cgr-card-shine{position:absolute;top:-40%;left:-80%;z-index:3;width:45%;height:180%;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);transform:rotate(15deg);}
.cgr-mark{position:absolute;bottom:1.5rem;left:1.5rem;z-index:5;color:#fff;font-size:clamp(1.25rem,2vw,2rem);font-weight:800;letter-spacing:-.08em;line-height:1;transform:scale(5.7);transform-origin:bottom left;white-space:nowrap;will-change:transform;}
.cgr-copy{position:absolute;top:50%;left:50%;z-index:4;display:flex;width:min(820px,calc(100% - 3rem));flex-direction:column;align-items:center;gap:1.8rem;text-align:center;transform:translate(-50%,-50%);}
.cgr-kicker{color:rgba(255,255,255,.66);font-size:.72rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;}
.cgr-copy h2{display:flex;flex-wrap:wrap;justify-content:center;column-gap:.27em;color:#fff;font-family:inherit;font-size:clamp(1.7rem,3.6vw,4rem);font-weight:520;letter-spacing:-.05em;line-height:1.08;text-wrap:balance;text-shadow:0 4px 30px rgba(31,61,43,.45);}
.cgr-word{display:inline-block;opacity:0;will-change:opacity,transform;}
.cgr-button{opacity:0;will-change:opacity,transform;}
.cgr-footer{position:absolute;right:1.5rem;bottom:1.5rem;z-index:4;width:min(210px,32vw);color:rgba(255,255,255,.88);font-size:clamp(1rem,1.5vw,1.45rem);font-weight:540;letter-spacing:-.045em;line-height:1.08;will-change:opacity,transform,filter;}
.cgr-overlay{position:absolute;inset:0;z-index:10;pointer-events:none;background:#1f3d2b;opacity:0;will-change:opacity;}
.cgr-showcase,.cgr-contact{display:flex;min-height:100svh;flex-direction:column;align-items:center;justify-content:center;padding:clamp(2rem,7vw,7rem);text-align:center;}
.cgr-showcase{background:radial-gradient(circle at 50% -10%,rgba(233,239,227,.16),transparent 43%),linear-gradient(180deg,#1f3d2b,#2e5b3f);}
.cgr-contact{background:radial-gradient(circle at 50% 115%,rgba(201,168,118,.32),transparent 45%),linear-gradient(180deg,#2e5b3f,#1f3d2b);}
.cgr-bg{position:absolute;inset:0;z-index:0;}
.cgr-bg img{object-fit:cover;}
.cgr-bg::after{content:"";position:absolute;inset:0;}
.cgr-showcase .cgr-bg::after{background:radial-gradient(ellipse at 50% 45%,rgba(31,61,43,.55),rgba(31,61,43,.82) 75%),linear-gradient(180deg,#1f3d2b 0%,transparent 22%);}
.cgr-contact .cgr-bg::after{background:radial-gradient(circle at 50% 115%,rgba(201,168,118,.35),transparent 45%),radial-gradient(ellipse at 50% 45%,rgba(31,61,43,.5),rgba(31,61,43,.82) 75%);}
.cgr-showcase > :not(.cgr-bg),.cgr-contact > :not(.cgr-bg){position:relative;z-index:1;}
.cgr-section-label{margin-bottom:1.5rem !important;color:rgba(255,255,255,.55);font-size:.72rem;font-weight:750;letter-spacing:.18em;text-transform:uppercase;}
.cgr-showcase h2,.cgr-contact h2{max-width:1100px;color:#fff;font-family:inherit;font-size:clamp(3.2rem,8.5vw,9rem);font-weight:520;letter-spacing:-.08em;line-height:.87;text-wrap:balance;}
.cgr-section-description{max-width:550px;margin-top:2rem !important;color:rgba(255,255,255,.62);font-size:clamp(1rem,1.35vw,1.25rem);line-height:1.6;}
.cgr-contact-cta{margin-top:2.5rem;}
@media (max-width:900px){.cgr-gallery{width:calc(335% + 1.5rem);height:calc(300svh + 1.5rem);gap:.75rem;} .cgr-column{gap:.75rem;} .cgr-mark{bottom:1.25rem;left:1.25rem;transform:scale(2.2);} .cgr-copy{width:calc(100% - 2rem);gap:1.4rem;} .cgr-copy h2{font-size:clamp(2rem,8vw,3.8rem);line-height:1;} .cgr-footer{right:auto;bottom:16svh;left:50%;width:220px;text-align:center;transform:translateX(-50%);}}
@media (hover:hover){.cgr-card:hover img{filter:saturate(1.18) contrast(1.06);} .cgr-card:hover .cgr-card-shine{animation:cgr-shine 850ms ease forwards;}}
@keyframes cgr-shine{from{left:-80%;}to{left:145%;}}
`;
