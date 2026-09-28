"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import { coverageFor, towns, zipCentroids } from "@/lib/areas";
import { business } from "@/lib/site";
import { ArrowRightIcon, PhoneIcon, PinIcon, SearchIcon } from "@/components/ui/Icons";
import type { MapCheck } from "./ServiceMap";

// Leaflet touches `window`, so the map only ever renders in the browser.
const ServiceMap = dynamic(() => import("./ServiceMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-parchment text-sm font-semibold text-stone">Loading map…</div>
  ),
});

type Result = { state: "idle" } | { state: "loading" } | { state: "done"; check: MapCheck } | { state: "error"; message: string };

export function ServiceArea() {
  const [activeTown, setActiveTown] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result>({ state: "idle" });
  const check = result.state === "done" ? result.check : null;

  const selectTown = useCallback((id: string | null) => {
    setResult((r) => (r.state === "done" ? { state: "idle" } : r));
    setActiveTown(id);
  }, []);

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) {
      setResult({ state: "error", message: "Enter a street address, town or 5-digit ZIP code." });
      return;
    }
    setResult({ state: "loading" });

    let point: { lat: number; lng: number; label: string } | null = null;
    const zip = q.match(/^\s*(\d{5})(?:-\d{4})?\s*$/)?.[1];
    if (zip && zipCentroids[zip]) point = zipCentroids[zip];

    if (!point) {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { result?: { lat: number; lng: number; label: string } | null; error?: string };
        if (!res.ok || data.error) {
          setResult({ state: "error", message: data.error ?? "Something went wrong. Please try again." });
          return;
        }
        if (!data.result) {
          setResult({ state: "error", message: `We couldn't find “${q}”. Try adding your town, or use a ZIP code.` });
          return;
        }
        point = { ...data.result, label: data.result.label.split(",").slice(0, 3).join(",") };
      } catch {
        setResult({ state: "error", message: "The lookup is unavailable right now. Call us and we'll confirm by phone." });
        return;
      }
    }

    const { status, town } = coverageFor(point);
    setActiveTown(town.id);
    setResult({ state: "done", check: { ...point, status, town } });
  }

  return (
    <section id="service-area" aria-labelledby="area-title" className="py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-5">
            <p className="eyebrow" data-reveal>
              Service Area
            </p>
            <h2 id="area-title" data-split className="mt-4 font-display text-[clamp(2.3rem,4.8vw,3.75rem)] leading-[1.03] text-charcoal">
              Rooted in <em className="text-forest">Central Florida.</em>
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-stone" data-reveal>
              Five communities, one dependable crew — plus the surrounding areas. Pick a town, or check your address.
            </p>

            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Communities we serve">
              {towns.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => selectTown(t.id)}
                    aria-pressed={activeTown === t.id}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] ${
                      activeTown === t.id ? "bg-forest text-white" : "bg-white text-charcoal ring-1 ring-black/5"
                    }`}
                  >
                    <PinIcon className="h-4 w-4" />
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={onCheck} noValidate className="mt-8 rounded-[1.5rem] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/5 sm:p-6">
              <label htmlFor="address-check" className="font-display text-lg text-charcoal">
                Check your address
              </label>
              <p className="mt-1 text-sm text-stone">Street address or ZIP code — we&apos;ll show you on the map.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
                  <input
                    id="address-check"
                    type="text"
                    autoComplete="street-address"
                    placeholder="123 Main St, Davenport or 33837"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-describedby="address-check-result"
                    className="field !pl-11"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={result.state === "loading"}>
                  {result.state === "loading" ? "Checking…" : "Check"}
                </button>
              </div>

              <div id="address-check-result" aria-live="polite">
                {result.state === "error" && <p className="mt-4 rounded-2xl bg-parchment p-4 text-sm text-ink">{result.message}</p>}
                {result.state === "done" && <ResultCard check={result.check} />}
              </div>
            </form>
          </div>

          <div className="min-w-0 lg:col-span-7" data-reveal>
            <div className="service-map relative h-[440px] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)] ring-1 ring-black/5 sm:h-[540px] lg:h-full lg:min-h-[620px]">
              <ServiceMap activeTown={activeTown} onTownSelect={selectTown} check={check} />
              <div className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-xs font-bold text-charcoal shadow-[var(--shadow-soft)] backdrop-blur">
                <span className="inline-block h-2.5 w-5 rounded-full border-2 border-dashed border-forest bg-forest/15" />
                Our service area
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ check }: { check: MapCheck }) {
  const tone =
    check.status === "in"
      ? { bg: "bg-mist", title: "Good news — you're covered.", body: `That's in our ${check.town.name} service zone.` }
      : check.status === "near"
        ? { bg: "bg-sand-soft/60", title: "You're just outside our core area.", body: `Your nearest community is ${check.town.name}. We often serve surrounding areas — give us a call to confirm.` }
        : { bg: "bg-parchment", title: "Looks like you're outside our area.", body: `Our nearest community is ${check.town.name}. Call us and we'll point you in the right direction.` };

  return (
    <div className={`mt-4 rounded-2xl p-4 ${tone.bg}`}>
      <p className="font-display text-lg text-charcoal">{tone.title}</p>
      <p className="mt-1 text-sm text-stone">{check.label}</p>
      <p className="mt-2 text-sm text-ink">{tone.body}</p>
      <div className="mt-3">
        {check.status === "in" ? (
          <Link href="/#quote" className="inline-flex items-center gap-1.5 text-sm font-bold text-forest">
            <span className="nav-link">Get your free quote</span> <ArrowRightIcon className="h-4 w-4" />
          </Link>
        ) : (
          <a href={business.phoneHref} className="inline-flex items-center gap-1.5 text-sm font-bold text-forest">
            <PhoneIcon className="h-4 w-4" /> <span className="nav-link">{business.phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
