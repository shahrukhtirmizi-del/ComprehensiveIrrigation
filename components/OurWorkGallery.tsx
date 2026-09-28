"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { CloseIcon } from "@/components/ui/Icons";

type Work = { caption: string; detail: string; src: string; alt: string };

const works: Work[] = [
  {
    caption: "Valve Repair",
    detail: "Rebuilding a faulty zone valve so every station opens and closes on cue.",
    src: "/images/work-valve-box-pliers.jpg",
    alt: "Technician's hands using pliers on the wiring of irrigation valves inside a green valve box",
  },
  {
    caption: "Backyard Turf & Beds",
    detail: "Even coverage from the lanai to the waterline, with beds kept sharp.",
    src: "/images/work-pool-backyard-sunset.jpg",
    alt: "Wide backyard with a pool, palm trees and freshly mowed lawn at sunset",
  },
  {
    caption: "Mulch & Bed Edging",
    detail: "Fresh mulch and crisp edges that hold moisture where plants need it.",
    src: "/images/work-mulch-bed-croton.jpg",
    alt: "Curved landscape bed of red croton plants with fresh mulch and a clean edge against green turf",
  },
  {
    caption: "Sprinkler Repair",
    detail: "Replacing and re-aiming heads so water lands on lawn, not pavement.",
    src: "/images/work-technician-sprinkler-head.jpg",
    alt: "Irrigation technician kneeling on a lawn adjusting a spraying sprinkler head",
  },
  {
    caption: "Healthy Turf",
    detail: "The right amount of water, on the right schedule, shows up in every blade.",
    src: "/images/work-grass-dew-macro.jpg",
    alt: "Close-up of green grass blades covered in morning dew drops",
  },
  {
    caption: "Front-Yard Maintenance",
    detail: "Mowing, edging and bed care that keeps curb appeal consistent week to week.",
    src: "/images/work-sunny-front-yard.jpg",
    alt: "Sunny front yard of a Florida home with a striped lawn, palms and tidy planting beds",
  },
  {
    caption: "System Inspection",
    detail: "Zone-by-zone checks of pressure, spray pattern and coverage.",
    src: "/images/work-sprinkler-spray-closeup.jpg",
    alt: "Close-up of a rotary sprinkler head spraying water across a green lawn in daylight",
  },
];

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const pad = (n: number) => String(n).padStart(2, "0");

const VERTEX = `
  attribute vec2 a_position;
  attribute vec2 a_uv;
  varying vec2 v_uv;
  void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;
const FRAGMENT = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_uv;
  void main() {
    vec4 color = texture2D(u_image, v_uv);
    color.rgb = (color.rgb - 0.5) * 1.015 + 0.5;
    gl_FragColor = color;
  }
`;

/**
 * The refractive lens: every photo is drawn to a WebGL canvas as a vertical triangle strip. Rows that
 * drift toward the top or bottom edge of the frame are pulled out toward the full frame width, as if
 * seen through curved glass, then relax back to a rounded card as they reach the middle.
 */
function useLensRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cardRefs: React.RefObject<(HTMLElement | null)[]>,
  enabled: boolean,
  onReady: () => void,
) {
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.parentElement;
    if (!enabled || !canvas || !frame) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
      gl.deleteShader(shader);
      return null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    const aPos = gl.getAttribLocation(program, "a_position");
    const aUv = gl.getAttribLocation(program, "a_uv");
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(aPos);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const textures = new Map<number, { texture: WebGLTexture; image: HTMLImageElement }>();
    let disposed = false;
    let announced = false;
    const SEGMENTS = 160;
    const verts = new Float32Array((SEGMENTS + 1) * 8);

    works.forEach((work, index) => {
      const image = new Image();
      image.decoding = "async";
      image.src = work.src;
      image.onload = () => {
        if (disposed) return;
        const texture = gl.createTexture();
        if (!texture) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        textures.set(index, { texture, image });
      };
    });

    const draw = () => {
      if (disposed) return;
      const frameBox = frame.getBoundingClientRect();
      // Skip work entirely while the gallery is off screen.
      if (frameBox.bottom < 0 || frameBox.top > window.innerHeight) return;
      const W = Math.max(1, frame.clientWidth);
      const H = Math.max(1, frame.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const pw = Math.round(W * dpr);
      const ph = Math.round(H * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      gl.viewport(0, 0, pw, ph);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const lens = clamp(H * 0.23, 150, 310);
      cardRefs.current?.forEach((card) => {
        if (!card) return;
        const box = card.getBoundingClientRect();
        const top = box.top - frameBox.top;
        if (top + box.height < -2 || top > H + 2) return;
        const index = Number(card.dataset.workIndex);
        const tex = textures.get(index);
        if (!tex) return;

        const cx = box.left - frameBox.left + box.width / 2;
        const halfW = box.width / 2;
        const radius = Math.min(30, halfW);
        // object-fit: cover crop in UV space
        const imgAspect = tex.image.naturalWidth / tex.image.naturalHeight;
        const boxAspect = box.width / box.height;
        let u0 = 0, u1 = 1, v0 = 0, v1 = 1;
        if (imgAspect > boxAspect) {
          u0 = (1 - boxAspect / imgAspect) / 2;
          u1 = 1 - u0;
        } else {
          v0 = (1 - imgAspect / boxAspect) / 2;
          v1 = 1 - v0;
        }

        for (let i = 0; i <= SEGMENTS; i++) {
          const t = i / SEGMENTS;
          const y = top + t * box.height;
          const local = t * box.height;
          // rounded-rectangle profile
          let inset = 0;
          if (local < radius) inset = radius - Math.sqrt(radius * radius - (radius - local) ** 2);
          else if (box.height - local < radius) inset = radius - Math.sqrt(radius * radius - (radius - (box.height - local)) ** 2);
          const edge = Math.pow(Math.max(1 - smoothstep(0, lens, y), smoothstep(H - lens, H, y)), 1.38);
          const base = halfW - inset;
          const half = base + (W * 0.515 - base) * edge;
          const uInset = (u1 - u0) * (inset / box.width);
          const clipY = 1 - (y / H) * 2;
          const v = 1 - (v0 + (v1 - v0) * t);
          const k = i * 8;
          verts[k] = ((cx - half) / W) * 2 - 1;
          verts[k + 1] = clipY;
          verts[k + 2] = u0 + uInset;
          verts[k + 3] = v;
          verts[k + 4] = ((cx + half) / W) * 2 - 1;
          verts[k + 5] = clipY;
          verts[k + 6] = u1 - uInset;
          verts[k + 7] = v;
        }
        gl.bindTexture(gl.TEXTURE_2D, tex.texture);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STREAM_DRAW);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, (SEGMENTS + 1) * 2);
      });

      if (!announced && textures.size === works.length) {
        announced = true;
        onReady();
      }
    };

    gsap.ticker.add(draw);
    return () => {
      disposed = true;
      gsap.ticker.remove(draw);
      textures.forEach(({ texture }) => gl.deleteTexture(texture));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [canvasRef, cardRefs, enabled, onReady]);
}

function DetailView({ initialIndex, onClose }: { initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState({ w: 1280, h: 800 });
  const drag = useRef({ active: false, x: 0, time: 0, velocity: 0, moved: 0, target: null as number | null });
  const wheelLock = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const measure = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    closeRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  const go = useCallback((i: number) => setIndex(clamp(i, 0, works.length - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go, onClose]);

  const cardW = clamp(size.w * 0.5, 240, 560);
  const cardH = clamp(size.h * 0.5, 260, 600);
  const step = cardW + clamp(size.w * 0.06, 24, 64);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Our work — photo viewer"
      className={`fixed inset-0 z-[75] touch-none select-none overflow-hidden bg-cream ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      data-lenis-prevent
      onPointerDown={(e) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const card = (e.target as HTMLElement).closest<HTMLElement>("[data-detail-index]");
        drag.current = { active: true, x: e.clientX, time: performance.now(), velocity: 0, moved: 0, target: card ? Number(card.dataset.detailIndex) : null };
        setDragging(true);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.active) return;
        const now = performance.now();
        const dx = e.clientX - d.x;
        d.velocity = dx / Math.max(now - d.time, 1);
        d.x = e.clientX;
        d.time = now;
        d.moved += Math.abs(dx);
        setDragX((x) => {
          const resist = (index === 0 && x + dx > 0) || (index === works.length - 1 && x + dx < 0) ? 0.24 : 1;
          return clamp(x + dx * resist, -step * 1.12, step * 1.12);
        });
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        if (!d.active) return;
        d.active = false;
        setDragging(false);
        if (d.moved <= 7 && d.target !== null) go(d.target);
        else {
          if (dragX < -step * 0.16 || d.velocity < -0.42) go(index + 1);
          if (dragX > step * 0.16 || d.velocity > 0.42) go(index - 1);
        }
        setDragX(0);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onWheel={(e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (wheelLock.current || Math.abs(delta) < 8) return;
        wheelLock.current = true;
        go(index + (delta > 0 ? 1 : -1));
        window.setTimeout(() => (wheelLock.current = false), 520);
      }}
    >
      <div className="container-x flex items-center justify-between pt-6">
        <button ref={closeRef} type="button" onClick={onClose} className="btn btn-outline-dark !py-3 text-sm">
          <CloseIcon className="h-4 w-4" /> Back to gallery
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Our Work</p>
      </div>

      <ul className="absolute inset-0" aria-label="Photos">
        {works.map((work, i) => {
          const x = (i - index) * step + dragX;
          const active = i === index;
          return (
            <li
              key={work.src}
              data-detail-index={i}
              aria-current={active}
              className={`absolute left-1/2 top-1/2 ${active ? "z-[3]" : "z-[2]"}`}
              style={{
                width: cardW,
                transform: `translate3d(calc(-50% + ${x}px), -50%, 0) scale(${active ? 1 : 0.9})`,
                transition: dragging ? "none" : "transform 760ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease",
                opacity: Math.abs(i - index) > 2 ? 0 : active ? 1 : 0.55,
              }}
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-stone">
                {pad(i + 1)} — {work.caption}
              </p>
              <div className="overflow-hidden rounded-[1.75rem] bg-parchment shadow-[var(--shadow-lift)]" style={{ height: cardH }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- already decoded by the gallery canvas */}
                <img src={work.src} alt={work.alt} draggable={false} className="pointer-events-none h-full w-full object-cover" />
              </div>
              <p className={`mt-5 max-w-md text-[0.98rem] leading-relaxed text-ink transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`}>
                {work.detail}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="absolute bottom-6 left-5 text-xs font-bold uppercase tracking-[0.16em] text-stone md:left-8">Drag, swipe or use ← →</p>
      <p className="absolute bottom-6 right-5 text-xs font-bold tabular-nums tracking-[0.16em] text-stone md:right-8" aria-live="polite">
        {pad(index + 1)} / {pad(works.length)}
      </p>
    </div>
  );
}

export default function OurWorkGallery() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [lensEnabled, setLensEnabled] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    const id = requestAnimationFrame(() => setLensEnabled(!prefersReducedMotion()));
    return () => cancelAnimationFrame(id);
  }, []);
  const onReady = useCallback(() => setReady(true), []);
  useLensRenderer(canvasRef, cardRefs, lensEnabled, onReady);

  // Caption follows whichever photo is nearest the middle of the frame.
  useEffect(() => {
    const pick = () => {
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const r = card.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    return () => window.removeEventListener("scroll", pick);
  }, []);

  const open = (i: number) => {
    setOpenIndex(i);
    stop();
  };
  const close = useCallback(() => {
    const i = openIndex;
    setOpenIndex(null);
    start();
    if (i !== null) requestAnimationFrame(() => cardRefs.current[i]?.focus({ preventScroll: true }));
  }, [openIndex, start]);

  return (
    <section id="work" aria-labelledby="work-title" className="py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow" data-reveal>
              Our Work
            </p>
            <h2 id="work-title" data-split className="mt-4 font-display text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.02] text-charcoal">
              Recent work across <em className="italic text-forest">Central Florida.</em>
            </h2>
          </div>
          <p className="text-[1.02rem] leading-relaxed text-stone md:col-span-5 md:pb-2" data-reveal>
            Valve rebuilds, sprinkler repair, beds and turf. Keep scrolling to move through the collection; tap any
            photo to open it.
          </p>
        </div>
      </div>

      <div className="mt-12 px-2 md:mt-16 md:px-3">
        <div className="relative overflow-clip rounded-[1.75rem] bg-charcoal md:rounded-[2.25rem]">
          {/* Sticky lens frame: stays put while the photos travel underneath it. */}
          <div className="pointer-events-none sticky top-0 z-[1] -mb-[100svh] h-[100svh]">
            <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
            <p
              aria-hidden
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden text-center font-display text-[clamp(2rem,6.5vw,5rem)] leading-[1.15] tracking-[-0.03em] text-white mix-blend-difference"
              style={{ height: "1.15em" }}
            >
              {works.map((w, i) => {
                let offset = i - active;
                if (offset > works.length / 2) offset -= works.length;
                if (offset < -works.length / 2) offset += works.length;
                return (
                  <span
                    key={w.src}
                    className="absolute inset-0 transition-[transform,opacity,filter] duration-700 ease-[var(--ease-out-soft)]"
                    style={{
                      opacity: i === active ? 1 : 0,
                      filter: i === active ? "blur(0)" : "blur(8px)",
                      transform: i === active ? "translate3d(0,0,0)" : `translate3d(0, ${offset * 72}%, 0) scale(.985)`,
                    }}
                  >
                    {w.caption}
                  </span>
                );
              })}
            </p>
            <p className="absolute bottom-5 left-5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/55 md:left-8">
              Scroll · Tap to open
            </p>
            <p className="absolute bottom-5 right-5 text-[0.7rem] font-bold tabular-nums tracking-[0.18em] text-white/55 md:right-8">
              {pad(active + 1)} / {pad(works.length)}
            </p>
          </div>

          <ul className="relative z-[2] flex flex-col items-center pb-[32svh] pt-[32svh]" aria-label="Project photos">
            {works.map((work, i) => (
              <li key={work.src} className="mb-[clamp(28px,6vh,64px)] last:mb-0">
                <button
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  type="button"
                  data-work-index={i}
                  onClick={() => open(i)}
                  aria-label={`Open photo: ${work.caption}`}
                  className="group relative block aspect-[3/4] w-[clamp(200px,34vw,380px)] rounded-[1.9rem] focus-visible:outline-offset-8"
                >
                  <span
                    className={`absolute inset-0 overflow-hidden rounded-[1.9rem] bg-forest-deep transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- fallback until the WebGL lens has the texture */}
                    <img src={work.src} alt={work.alt} loading="lazy" draggable={false} className="h-full w-full object-cover" />
                  </span>
                  <span className="absolute -bottom-8 left-0 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/60">
                    {pad(i + 1)} — {work.caption}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {openIndex !== null && <DetailView initialIndex={openIndex} onClose={close} />}
    </section>
  );
}
