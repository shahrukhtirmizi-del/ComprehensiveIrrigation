"use client";

import React, { useEffect, useRef } from "react";
import { business } from "@/lib/site";

const CSS = `
  .nf-section {
    --mouse-x: 0; --mouse-y: 0;
    --nf-green: var(--brand-sampled, #2F5233);
    position: relative; width: 100%; height: 100svh; min-height: 560px; max-height: 1000px;
    overflow: hidden; background: #F7F4EE; color: #1a1813;
    font-family: var(--font-sans), Arial, Helvetica, sans-serif; isolation: isolate;
  }
  .nf-title {
    position: absolute; top: max(5.2%, 92px); left: 3.65%; z-index: 5; margin: 0;
    font-family: var(--font-sans), Arial, Helvetica, sans-serif; font-size: clamp(56px, 8vw, 130px);
    font-weight: 800; line-height: 0.82; letter-spacing: -0.04em;
    text-transform: uppercase; color: var(--nf-green); pointer-events: none;
  }
  .nf-title-line { display: block; overflow: hidden; padding-bottom: 0.1em; }
  .nf-title-word { display: block; animation: nf-title-in 1.05s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .nf-title-line:nth-child(2) .nf-title-word { animation-delay: 100ms; }
  .nf-left-copy { position: absolute; left: 3.7%; top: 56.7%; z-index: 4; width: min(260px, 22vw); }
  .nf-eyebrow, .nf-detail { margin: 0; font-size: clamp(12px, 0.95vw, 15px); line-height: 1.55; }
  .nf-eyebrow { margin-bottom: clamp(24px, 6vh, 48px); color: #6b6456; }
  .nf-detail strong { font-weight: 700; color: var(--nf-green); }
  .nf-left-copy > * { opacity: 0; transform: translateY(18px); animation: nf-copy-in 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .nf-left-copy .nf-eyebrow { animation-delay: 720ms; }
  .nf-left-copy .nf-detail { animation-delay: 830ms; }
  .nf-main-visual {
    position: absolute; top: 28%; left: 24%; z-index: 2; width: 44%; height: 52%;
    min-height: 205px; margin: 0; overflow: hidden; border-radius: 32px; background: #e5e3de;
    box-shadow: 0 2px 4px rgb(34 38 31 / 0.06), 0 22px 44px -16px rgb(34 38 31 / 0.28);
  }
  .nf-main-image, .nf-small-image {
    width: 100%; height: 100%; display: block; object-fit: cover;
    transform: translate3d(calc(var(--mouse-x) * -8px), calc(var(--mouse-y) * -6px), 0) scale(1.05);
    transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .nf-right-panel { position: absolute; top: 30%; left: 71%; z-index: 3; width: 25%; max-width: 380px; }
  .nf-small-visual { position: relative; width: 100%; height: clamp(110px, 22vh, 200px); margin: 0; overflow: hidden; border-radius: 28px; background: #ddd9d0; }
  .nf-right-text { padding-top: clamp(20px, 4vh, 36px); }
  .nf-heading {
    margin: 0; font-family: var(--font-display), Georgia, serif; font-size: clamp(26px, 2.4vw, 42px);
    font-weight: 500; line-height: 1.02; letter-spacing: -0.02em; color: var(--nf-green);
  }
  .nf-description { max-width: 340px; margin-top: 20px; color: #4a4438; line-height: 1.6; font-size: clamp(14px, 1vw, 16px); }
  /* Hold every entrance until the section is actually on screen. */
  .nf-section:not(.is-in) .nf-title-word,
  .nf-section:not(.is-in) .nf-left-copy > * { animation-play-state: paused; }
  @keyframes nf-title-in { from { transform: translateY(115%); } to { transform: translateY(0); } }
  @keyframes nf-copy-in { to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 900px) {
    .nf-section { height: auto; max-height: none; min-height: 0; padding: 28px 20px 64px; overflow: visible; }
    .nf-title { position: relative; top: auto; left: auto; font-size: clamp(56px, 14vw, 100px); }
    .nf-main-visual { position: relative; top: auto; left: auto; width: 100%; height: 360px; margin-top: 20px; }
    .nf-left-copy { position: relative; top: auto; left: auto; width: 100%; margin-top: 24px; }
    .nf-right-panel { position: relative; top: auto; left: auto; width: 100%; max-width: none; margin-top: 30px; }
    .nf-small-visual { height: 220px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .nf-title-word, .nf-left-copy > * { animation: none; opacity: 1; transform: none; }
    .nf-main-image, .nf-small-image { transform: scale(1.02); }
  }
`;

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const section = sectionRef.current;
    if (!section || event.pointerType !== "mouse") return;
    const bounds = section.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      section.style.setProperty("--mouse-x", x.toFixed(3));
      section.style.setProperty("--mouse-y", y.toFixed(3));
    });
  };

  const resetPointer = () => {
    sectionRef.current?.style.setProperty("--mouse-x", "0");
    sectionRef.current?.style.setProperty("--mouse-y", "0");
  };

  return (
    <>
      <style>{CSS}</style>
      <section
        id="about"
        ref={sectionRef}
        className="nf-section"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        aria-labelledby="about-title"
      >
        <h2 id="about-title" className="nf-title" aria-label="About Us">
          <span className="nf-title-line" aria-hidden>
            <span className="nf-title-word">About</span>
          </span>
          <span className="nf-title-line" aria-hidden>
            <span className="nf-title-word">Us</span>
          </span>
        </h2>
        <div className="nf-left-copy">
          <p className="nf-eyebrow">Serving Central Florida&apos;s green industry for 25+ years</p>
          <p className="nf-detail">
            <strong>Licensed &amp; Insured:</strong> {business.license}. A Grounds Guys Partner trusted across Champions
            Gate, Celebration, Haines City, Davenport, and Four Corners.
          </p>
        </div>
        <figure className="nf-main-visual">
          {/* eslint-disable-next-line @next/next/no-img-element -- parallax transform is driven by CSS variables */}
          <img
            className="nf-main-image"
            src="/images/about-crew-truck.jpg"
            alt="Three members of the Comprehensive Irrigation crew in green uniforms talking beside their service truck"
            loading="lazy"
          />
        </figure>
        <aside className="nf-right-panel">
          <figure className="nf-small-visual">
            {/* eslint-disable-next-line @next/next/no-img-element -- parallax transform is driven by CSS variables */}
            <img
              className="nf-small-image"
              src="/images/about-valve-adjustment.jpg"
              alt="Technician's hands adjusting an irrigation valve in a valve box set in a mulch bed"
              loading="lazy"
            />
          </figure>
          <div className="nf-right-text">
            <h3 className="nf-heading">Built on Water-Smart Craftsmanship</h3>
            <p className="nf-description">
              Irrigation repair alone can cut water waste by up to 30%. We install, repair, and maintain systems built to
              save water without sacrificing a healthy lawn.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
