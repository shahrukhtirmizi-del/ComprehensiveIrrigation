"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { serviceCategories, type ServiceCategory } from "@/lib/services";
import { gsap, Flip, prefersReducedMotion } from "@/lib/gsap";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { ArrowRightIcon, ArrowUpRightIcon, CloseIcon, DropIcon } from "@/components/ui/Icons";

import { SELECT_SERVICE_EVENT } from "@/components/ui/QuoteLink";

function TiltCard({ category, hidden, onOpen }: { category: ServiceCategory; hidden: boolean; onOpen: (el: HTMLElement) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const quick = useRef<{ rx: gsap.QuickToFunc; ry: gsap.QuickToFunc } | null>(null);

  useEffect(() => {
    if (!inner.current) return;
    gsap.set(inner.current, { transformPerspective: 1000 });
    quick.current = {
      rx: gsap.quickTo(inner.current, "rotationX", { duration: 0.6, ease: "power3.out" }),
      ry: gsap.quickTo(inner.current, "rotationY", { duration: 0.6, ease: "power3.out" }),
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !wrap.current || !quick.current || prefersReducedMotion()) return;
    const r = wrap.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    // Tilt toward the cursor: the edge under the pointer dips away.
    quick.current.ry(x * 9);
    quick.current.rx(-y * 9);
  };

  const reset = () => {
    quick.current?.rx(0);
    quick.current?.ry(0);
  };

  return (
    <div
      ref={wrap}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="group relative h-full [perspective:1000px]"
      style={{ visibility: hidden ? "hidden" : "visible" }}
      data-reveal
    >
      <div
        ref={inner}
        data-flip-id={`service-${category.id}`}
        className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-forest-deep shadow-[var(--shadow-soft)] transition-[box-shadow,translate] duration-500 ease-[var(--ease-out-soft)] will-change-transform group-hover:-translate-y-2 group-hover:shadow-[var(--shadow-lift)] group-has-[:focus-visible]:-translate-y-2 group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-sand"
      >
        {/* Photo area — nothing but the image (and the one badge) ever sits on top of it. */}
        <div className="relative z-0 aspect-[4/3] shrink-0 overflow-hidden">
          <Image
            src={category.image.src}
            alt={category.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
          />
          {category.id === "irrigation" && (
            <span className="absolute left-4 top-4 z-[1] inline-flex items-center gap-2 rounded-full bg-white/92 px-3.5 py-2 text-xs font-bold text-charcoal shadow-[var(--shadow-soft)] backdrop-blur">
              <DropIcon className="h-3.5 w-3.5 text-forest" />
              Up to 30% less water waste
            </span>
          )}
        </div>

        {/* Content panel on solid brand green, in normal flow below the photo — no overlap at any width. */}
        <div className="relative z-[1] flex flex-1 flex-col p-6 text-white md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sand">{category.eyebrow}</p>
          <h3 className="mt-2 font-display text-[1.85rem] leading-[1.05] md:text-[2.1rem]">{category.title}</h3>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {category.services.map((s) => (
              <li key={s.name} className="rounded-full bg-white/10 px-3 py-1.5 text-[0.75rem] font-semibold text-white/90 ring-1 ring-white/15">
                {s.name}
              </li>
            ))}
          </ul>
          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold" aria-hidden>
            Explore services
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-charcoal transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:rotate-45">
              <ArrowUpRightIcon className="h-4 w-4" />
            </span>
          </span>
        </div>

        {/* Stretched button: the whole card is the click target. */}
        <button
          type="button"
          onClick={() => {
            if (!inner.current) return;
            gsap.killTweensOf(inner.current);
            gsap.set(inner.current, { rotationX: 0, rotationY: 0 });
            onOpen(inner.current);
          }}
          aria-haspopup="dialog"
          aria-label={`Explore ${category.title} services`}
          className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-card)] focus-visible:outline-none"
        />
      </div>
    </div>
  );
}

function ServiceModal({
  category,
  panelRef,
  onClose,
  onQuote,
}: {
  category: ServiceCategory;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onQuote: (service: string) => void;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>("button, a[href]");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, panelRef]);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-3 md:p-8" role="presentation">
      <div
        data-modal-backdrop
        className="absolute inset-0 bg-charcoal/45 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-${category.id}-title`}
        data-flip-id={`service-${category.id}`}
        className="relative flex max-h-[calc(100svh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[var(--radius-card)] bg-cream shadow-[var(--shadow-lift)] md:max-h-[calc(100svh-4rem)] md:flex-row"
      >
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-56 md:h-auto md:w-[42%]">
          <Image src={category.image.src} alt={category.image.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent md:bg-gradient-to-r" />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 md:p-10" data-lenis-prevent data-modal-content>
          <p className="eyebrow">{category.eyebrow}</p>
          <h3 id={`modal-${category.id}-title`} className="mt-2 font-display text-[2rem] leading-[1.05] text-charcoal md:text-[2.6rem]">
            {category.title}
          </h3>
          <p className="mt-3 max-w-lg text-[0.98rem] leading-relaxed text-stone">{category.intro}</p>

          <ul className="mt-7 space-y-3">
            {category.services.map((s) => (
              <li key={s.name} className="rounded-[1.25rem] bg-white p-5 shadow-[var(--shadow-soft)]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h4 className="font-display text-[1.25rem] text-charcoal">{s.name}</h4>
                  {s.highlight && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-bold text-forest">
                      <DropIcon className="h-3.5 w-3.5" /> {s.highlight}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-stone">{s.summary}</p>
                <button
                  type="button"
                  onClick={() => onQuote(s.name)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-forest"
                >
                  <span className="nav-link">Quote this service</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => onQuote(category.services[0].name)} className="btn btn-primary">
              Get a Free Quote <ArrowRightIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose} className="btn btn-outline-dark">
              Back to services
            </button>
          </div>
        </div>

        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-charcoal shadow-[var(--shadow-soft)] transition-transform duration-500 hover:rotate-90"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function Services() {
  const [active, setActive] = useState<ServiceCategory | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const origin = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const { stop, start, scrollTo } = useSmoothScroll();

  const open = (category: ServiceCategory, el: HTMLElement) => {
    origin.current = el;
    flipState.current = prefersReducedMotion() ? null : Flip.getState(el);
    setActive(category);
    stop();
  };

  // Morph the card into the modal.
  useLayoutEffect(() => {
    if (!active || !panelRef.current) return;
    const panel = panelRef.current;
    const content = panel.querySelector("[data-modal-content]");
    const backdrop = panel.parentElement?.querySelector("[data-modal-backdrop]");
    if (flipState.current) {
      Flip.from(flipState.current, { targets: panel, duration: 0.75, ease: "expo.inOut", scale: false, absolute: true });
      gsap.from(content, { opacity: 0, y: 20, duration: 0.5, delay: 0.45, ease: "power2.out" });
    }
    gsap.from(backdrop ?? [], { opacity: 0, duration: 0.5 });
  }, [active]);

  const close = useCallback(() => {
    if (!active || closing.current) return;
    const panel = panelRef.current;
    const card = origin.current;
    const done = () => {
      closing.current = false;
      setActive(null);
      start();
      // Wait for the card to become visible again before returning focus to it.
      requestAnimationFrame(() => card?.querySelector("button")?.focus({ preventScroll: true }));
    };
    if (!panel || !card || prefersReducedMotion()) return done();
    closing.current = true;
    const backdrop = panel.parentElement?.querySelector("[data-modal-backdrop]");
    const content = panel.querySelector("[data-modal-content]");
    const cardBox = card.getBoundingClientRect();
    const box = panel.getBoundingClientRect();
    gsap.to(content, { opacity: 0, duration: 0.2 });
    gsap.to(backdrop ?? [], { opacity: 0, duration: 0.55, delay: 0.1 });
    // Pin the panel where it is, then shrink it back onto the card it came from.
    gsap.set(panel, { position: "fixed", left: box.left, top: box.top, width: box.width, height: box.height, maxHeight: "none", margin: 0 });
    gsap.to(panel, {
      left: cardBox.left,
      top: cardBox.top,
      width: cardBox.width,
      height: cardBox.height,
      duration: 0.6,
      ease: "expo.inOut",
      onComplete: done,
    });
  }, [active, start]);

  const quote = (service: string) => {
    window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: service }));
    closing.current = false;
    setActive(null);
    start();
    requestAnimationFrame(() => scrollTo("#quote"));
  };

  return (
    <section id="services" aria-labelledby="services-title" className="py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow" data-reveal>
              Services
            </p>
            <h2 id="services-title" data-split className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[1.02] text-charcoal">
              Everything your landscape needs — starting with the <em className="italic text-forest">water.</em>
            </h2>
          </div>
          <p className="text-[1.05rem] leading-relaxed text-stone md:col-span-5 md:pb-2" data-reveal>
            From the valve box to the palm fronds, one licensed, insured crew looks after it all. Tap a category to see
            exactly what&apos;s included.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((c) => (
            <TiltCard key={c.id} category={c} hidden={active?.id === c.id} onOpen={(el) => open(c, el)} />
          ))}
        </div>
      </div>

      {active && <ServiceModal category={active} panelRef={panelRef} onClose={close} onQuote={quote} />}
    </section>
  );
}
