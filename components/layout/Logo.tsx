import Link from "next/link";
import { business } from "@/lib/site";

/** The official badge, fetched from comprehensiveirrigation.com — never redrawn. */
export function Logo({ size = 56, withWordmark = true, tone = "dark" }: { size?: number; withWordmark?: boolean; tone?: "dark" | "light" }) {
  return (
    <Link href="/" aria-label={`${business.name} — home`} className="group flex items-center gap-3">
      <span
        className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-[var(--shadow-soft)] ring-1 ring-black/5 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:rotate-[-8deg] group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- remote-proxied fallback must bypass the image optimizer */}
        <img src={business.logo} alt="" width={size} height={size} className="h-full w-full object-contain" />
      </span>
      {withWordmark && (
        <span className={`hidden leading-tight sm:block ${tone === "light" ? "text-white" : "text-charcoal"}`}>
          <span className="block font-display text-[1.05rem] font-semibold tracking-tight">Comprehensive</span>
          <span className={`block text-[0.68rem] font-bold uppercase tracking-[0.16em] ${tone === "light" ? "text-white/70" : "text-stone"}`}>
            Irrigation & Lawn
          </span>
        </span>
      )}
    </Link>
  );
}
