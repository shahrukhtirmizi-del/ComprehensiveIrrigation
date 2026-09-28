"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { DrapeOverlay, DrapeToggle } from "./DrapeMenu";
import { business } from "@/lib/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { PhoneIcon } from "@/components/ui/Icons";

export function Header() {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const busy = useRef(false);
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

  // Freeze the page under the drape.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      stop();
    } else if (wasOpen.current) {
      document.body.style.overflow = "";
      start();
    }
    wasOpen.current = open;
  }, [open, stop, start]);

  const toggle = () => {
    if (busy.current) return;
    busy.current = true;
    setOpen((v) => !v);
  };
  const settled = useCallback(() => {
    busy.current = false;
  }, []);
  // A menu link was chosen: let the drape retract while the page travels underneath.
  const navigate = useCallback(() => {
    busy.current = true;
    setOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        busy.current = true;
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || !overHero || open;
  const light = !solid;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* The drape sits under the header bar, so the real logo and the Close toggle stay on top of it. */}
      <DrapeOverlay open={open} onNavigate={navigate} onSettled={settled} />

      <div
        className={`relative z-[1] container-x pt-3 transition-transform duration-500 ease-[var(--ease-out-soft)] ${
          hidden && !open ? "-translate-y-[120%]" : "translate-y-0"
        }`}
      >
        <div
          className={`flex items-center justify-between gap-4 rounded-full py-2 pl-2 pr-2 transition-all duration-500 ${
            open
              ? "bg-transparent"
              : solid
                ? "bg-cream/85 shadow-[var(--shadow-soft)] ring-1 ring-black/5 backdrop-blur-xl"
                : "bg-transparent"
          }`}
        >
          <Logo size={48} tone={light ? "light" : "dark"} />

          <div className="flex items-center gap-2">
            <a
              href={business.phoneHref}
              className={`hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-bold md:flex ${light ? "text-white" : "text-charcoal"}`}
            >
              <PhoneIcon className="h-4 w-4" />
              <span className="nav-link">{business.phone}</span>
            </a>
            <Link href="/#quote" onClick={() => open && navigate()} className="btn btn-primary hidden !px-5 !py-3 text-sm sm:inline-flex">
              Get a Free Quote
            </Link>
            <DrapeToggle open={open} onToggle={toggle} light={light} buttonRef={toggleRef} />
          </div>
        </div>
      </div>
    </header>
  );
}
