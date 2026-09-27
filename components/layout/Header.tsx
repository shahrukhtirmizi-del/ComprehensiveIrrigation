"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { business, navLinks } from "@/lib/site";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { PhoneIcon } from "@/components/ui/Icons";

export function Header() {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 480 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      stop();
      document.body.style.overflow = "hidden";
    } else {
      start();
      document.body.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stop, start]);

  useGSAP(
    () => {
      if (!open || !menuRef.current || prefersReducedMotion()) return;
      gsap.from(menuRef.current.querySelectorAll("[data-menu-item]"), {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        delay: 0.1,
      });
    },
    { dependencies: [open], scope: menuRef },
  );

  const solid = scrolled || !overHero || open;
  const light = !solid;

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      onClickCapture={(e) => {
        // Any link inside the header (logo, nav, CTA) closes the mobile menu.
        if ((e.target as HTMLElement).closest("a")) setOpen(false);
      }}
    >
      <div
        className={`container-x pt-3 transition-transform duration-500 ease-[var(--ease-out-soft)] ${
          hidden && !open ? "-translate-y-[120%]" : "translate-y-0"
        }`}
      >
        <div
          className={`flex items-center justify-between gap-4 rounded-full py-2 pl-2 pr-2 transition-all duration-500 md:pr-3 ${
            solid ? "bg-cream/85 shadow-[var(--shadow-soft)] ring-1 ring-black/5 backdrop-blur-xl" : "bg-transparent"
          }`}
        >
          <Logo size={48} tone={light ? "light" : "dark"} />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className={`flex items-center gap-7 text-[0.92rem] font-semibold ${light ? "text-white" : "text-charcoal"}`}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={business.phoneHref}
              className={`hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-bold md:flex ${light ? "text-white" : "text-charcoal"}`}
            >
              <PhoneIcon className="h-4 w-4" />
              <span className="nav-link">{business.phone}</span>
            </a>
            <Link href="/#quote" className="btn btn-primary hidden !px-5 !py-3 text-sm sm:inline-flex">
              Get a Free Quote
            </Link>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className={`relative grid h-12 w-12 place-items-center rounded-full transition-colors lg:hidden ${
                light ? "bg-white/15 text-white backdrop-blur" : "bg-charcoal text-white"
              }`}
            >
              <span className="sr-only">Menu</span>
              <span
                className={`absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-500 ease-[var(--ease-out-soft)] ${
                  open ? "rotate-45" : "-translate-y-[4px]"
                }`}
              />
              <span
                className={`absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-500 ease-[var(--ease-out-soft)] ${
                  open ? "-rotate-45" : "translate-y-[4px]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-x-3 top-[5.25rem] bottom-3 overflow-y-auto rounded-[var(--radius-card)] bg-charcoal p-7 text-white shadow-[var(--shadow-lift)] lg:hidden"
        data-lenis-prevent
      >
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href} data-menu-item>
                <Link
                  href={link.href}
                  className="block rounded-2xl py-3 font-display text-[2rem] leading-tight transition-colors hover:text-sand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8 space-y-3" data-menu-item>
          <Link href="/#quote" className="btn btn-primary w-full !bg-brand">
            Get a Free Quote
          </Link>
          <a href={business.phoneHref} className="btn btn-ghost w-full">
            <PhoneIcon className="h-4 w-4" /> {business.phone}
          </a>
        </div>
        <p className="mt-8 text-sm text-white/60" data-menu-item>
          Mon–Fri 7:00 AM–5:00 PM · Sat 7:00 AM–3:00 PM
        </p>
      </div>
    </header>
  );
}
