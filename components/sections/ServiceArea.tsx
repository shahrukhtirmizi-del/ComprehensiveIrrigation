"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Circle, Marker, Polyline } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  towns,
  zipCentroids,
  nearestTown,
  SERVICE_RADIUS_MI,
  NEARBY_RADIUS_MI,
  type Town,
} from "@/lib/areas";
import { business } from "@/lib/site";
import { ArrowRightIcon, PhoneIcon, PinIcon, SearchIcon } from "@/components/ui/Icons";

type Result =
  | { status: "in" | "near" | "out"; label: string; town: Town; miles: number }
  | { status: "notfound"; query: string }
  | { status: "error" };

const MILE = 1609.34;
const CENTER: [number, number] = [28.225, -81.6];

export function ServiceArea() {
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const zones = useRef<Record<string, { circle: Circle; marker: Marker }>>({});
  const probe = useRef<{ marker: Marker; line: Polyline } | null>(null);
  const brand = useRef("#2F5233");

  const [activeTown, setActiveTown] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  // Build the map once, lazily (Leaflet touches window).
  useEffect(() => {
    let disposed = false;
    (async () => {
      const leaflet = (await import("leaflet")).default;
      if (disposed || !mapEl.current) return;
      L.current = leaflet;
      brand.current =
        getComputedStyle(document.documentElement).getPropertyValue("--brand-sampled").trim() || brand.current;

      const m = leaflet.map(mapEl.current, {
        center: CENTER,
        zoom: 10,
        zoomSnap: 0.25,
        scrollWheelZoom: false,
        zoomControl: false,
        dragging: !leaflet.Browser.mobile,
        attributionControl: true,
      });
      map.current = m;
      leaflet.control.zoom({ position: "bottomright" }).addTo(m);
      m.attributionControl.setPrefix(false);

      leaflet
        .tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
          subdomains: "abcd",
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        })
        .addTo(m);
      m.createPane("labels");
      const labelsPane = m.getPane("labels");
      if (labelsPane) {
        labelsPane.style.zIndex = "450";
        labelsPane.style.pointerEvents = "none";
      }
      leaflet
        .tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
          subdomains: "abcd",
          maxZoom: 18,
          pane: "labels",
        })
        .addTo(m);

      towns.forEach((town) => {
        const circle = leaflet
          .circle([town.lat, town.lng], {
            radius: SERVICE_RADIUS_MI * MILE,
            color: brand.current,
            weight: 1.5,
            opacity: 0.55,
            fillColor: brand.current,
            fillOpacity: 0.1,
          })
          .addTo(m);

        const marker = leaflet
          .marker([town.lat, town.lng], {
            icon: leaflet.divIcon({ className: "map-pin", html: "<span></span>", iconSize: [26, 26] }),
            keyboard: true,
            title: town.name,
            alt: town.name,
          })
          .addTo(m)
          .bindTooltip(town.name, { className: "town-tip", direction: "top", offset: [0, -12] })
          .bindPopup(
            `<p style="font-family:var(--font-fraunces);font-size:1.15rem;margin:0 0 4px;color:#22261f">${town.name}, FL</p>
             <p style="margin:0 0 10px;color:#62665d">${town.blurb}</p>
             <a href="/#quote" style="font-weight:700;color:${brand.current}">Get a free quote &rarr;</a>`,
            { closeButton: false, offset: [0, -6] },
          );

        const highlight = (on: boolean) => circle.setStyle({ fillOpacity: on ? 0.26 : 0.1, opacity: on ? 0.9 : 0.55 });
        circle.on("mouseover", () => highlight(true));
        circle.on("mouseout", () => highlight(false));
        circle.on("click", () => focusTown(town.id));
        marker.on("mouseover", () => highlight(true));
        marker.on("mouseout", () => highlight(false));
        marker.on("click", () => setActiveTown(town.id));
        zones.current[town.id] = { circle, marker };
      });

      const zoneBounds = Object.values(zones.current).reduce(
        (b, z) => b.extend(z.circle.getBounds()),
        leaflet.latLngBounds([]),
      );
      m.fitBounds(zoneBounds.pad(0.04));
    })();

    return () => {
      disposed = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Reflect the active town on its pin.
  useEffect(() => {
    Object.entries(zones.current).forEach(([id, { marker }]) => {
      marker.getElement()?.classList.toggle("is-active", id === activeTown);
    });
  }, [activeTown]);

  function focusTown(id: string) {
    const town = towns.find((t) => t.id === id);
    const zone = zones.current[id];
    if (!town || !map.current || !zone) return;
    setActiveTown(id);
    map.current.flyTo([town.lat, town.lng], 11, { duration: 1.1 });
    window.setTimeout(() => zone.marker.openPopup(), 900);
  }

  async function geocode(q: string): Promise<{ lat: number; lng: number; label: string } | null> {
    const zip = q.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1];
    if (zip && zipCentroids[zip] && q.replace(/[\s,-]/g, "").length <= 10) return zipCentroids[zip];

    const params = new URLSearchParams({
      q,
      format: "json",
      limit: "1",
      countrycodes: "us",
      viewbox: "-82.2,28.6,-81.1,27.8",
      addressdetails: "0",
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Geocoder ${res.status}`);
    const data: Array<{ lat: string; lon: string; display_name: string }> = await res.json();
    if (data.length) {
      return {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
        label: data[0].display_name.split(",").slice(0, 3).join(","),
      };
    }
    if (zip && zipCentroids[zip]) return zipCentroids[zip];
    return null;
  }

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) {
      setInputError("Enter a street address, town or 5-digit ZIP code.");
      return;
    }
    setInputError(null);
    setChecking(true);
    try {
      const point = await geocode(q);
      if (!point) {
        setResult({ status: "notfound", query: q });
        return;
      }
      const { town, miles } = nearestTown(point);
      const status = miles <= SERVICE_RADIUS_MI ? "in" : miles <= NEARBY_RADIUS_MI ? "near" : "out";
      setResult({ status, label: point.label, town, miles });
      setActiveTown(town.id);
      plotProbe(point, town, status);
    } catch {
      setResult({ status: "error" });
    } finally {
      setChecking(false);
    }
  }

  function plotProbe(point: { lat: number; lng: number }, town: Town, status: "in" | "near" | "out") {
    const leaflet = L.current;
    const m = map.current;
    if (!leaflet || !m) return;
    probe.current?.marker.remove();
    probe.current?.line.remove();
    const marker = leaflet
      .marker([point.lat, point.lng], {
        icon: leaflet.divIcon({ className: "map-pin map-pin-you", html: "<span></span>", iconSize: [26, 26] }),
        zIndexOffset: 1000,
        title: "Your location",
      })
      .addTo(m);
    const line = leaflet
      .polyline(
        [
          [point.lat, point.lng],
          [town.lat, town.lng],
        ],
        { color: status === "in" ? brand.current : "#c9a876", weight: 2, dashArray: "4 8", opacity: 0.9 },
      )
      .addTo(m);
    probe.current = { marker, line };

    Object.entries(zones.current).forEach(([id, { circle }]) =>
      circle.setStyle({ fillOpacity: id === town.id ? 0.28 : 0.08, opacity: id === town.id ? 0.9 : 0.4 }),
    );
    const bounds = leaflet.latLngBounds([
      [point.lat, point.lng],
      [town.lat, town.lng],
    ]);
    m.flyToBounds(bounds.pad(status === "in" ? 1.2 : 0.5), { duration: 1.3, maxZoom: 11 });
  }

  return (
    <section id="service-area" aria-labelledby="area-title" className="bg-parchment py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow" data-reveal>
              Service Area
            </p>
            <h2 id="area-title" data-split className="mt-4 font-display text-[clamp(2.3rem,4.8vw,3.75rem)] leading-[1.03] text-charcoal">
              Rooted in <em className="italic text-forest">Central Florida.</em>
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-stone" data-reveal>
              Five communities, one dependable crew — plus the surrounding areas. Pick a town, or check your address.
            </p>

            <ul className="mt-7 flex flex-wrap gap-2" data-stagger="0.07">
              {towns.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => focusTown(t.id)}
                    aria-pressed={activeTown === t.id}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] ${
                      activeTown === t.id ? "bg-forest text-white" : "bg-white text-charcoal"
                    }`}
                  >
                    <PinIcon className="h-4 w-4" />
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={onCheck} className="mt-8 rounded-[1.5rem] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6" noValidate data-reveal>
              <label htmlFor="address-check" className="font-display text-lg text-charcoal">
                Check your address
              </label>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
                  <input
                    id="address-check"
                    type="text"
                    inputMode="search"
                    autoComplete="street-address"
                    placeholder="Street address or ZIP"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-invalid={!!inputError}
                    aria-describedby={inputError ? "address-check-error" : undefined}
                    className="field !pl-11"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={checking}>
                  {checking ? "Checking…" : "Check"}
                </button>
              </div>
              {inputError && (
                <p id="address-check-error" className="mt-2 text-sm font-semibold text-[#b4533d]">
                  {inputError}
                </p>
              )}

              <div aria-live="polite">
                {result && <ResultCard result={result} />}
              </div>
            </form>
          </div>

          <div className="lg:col-span-7" data-reveal>
            <div className="service-map relative h-[420px] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)] ring-1 ring-black/5 sm:h-[520px] lg:h-full lg:min-h-[600px]">
              <div ref={mapEl} className="absolute inset-0" role="application" aria-label="Map of our service area" />
              <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-charcoal shadow-[var(--shadow-soft)] backdrop-blur">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-forest align-middle" />
                Core service zones
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ result }: { result: Result }) {
  if (result.status === "error") {
    return (
      <p className="mt-4 rounded-2xl bg-parchment p-4 text-sm text-ink">
        We couldn&apos;t reach the address lookup just now. Call{" "}
        <a href={business.phoneHref} className="font-bold text-forest">
          {business.phone}
        </a>{" "}
        and we&apos;ll confirm in seconds.
      </p>
    );
  }
  if (result.status === "notfound") {
    return (
      <p className="mt-4 rounded-2xl bg-parchment p-4 text-sm text-ink">
        We couldn&apos;t find “{result.query}”. Try adding your town or ZIP code.
      </p>
    );
  }
  const miles = result.miles < 1 ? "under a mile" : `about ${Math.round(result.miles)} mi`;
  const tone =
    result.status === "in"
      ? { bg: "bg-mist", title: "You're in our service area.", body: `Nearest community: ${result.town.name} (${miles}).` }
      : result.status === "near"
        ? {
            bg: "bg-sand-soft/60",
            title: "You're just outside our core zones.",
            body: `You're ${miles} from ${result.town.name}. We often serve surrounding areas — give us a call to confirm.`,
          }
        : {
            bg: "bg-parchment",
            title: "Looks like you're outside our area.",
            body: `You're ${miles} from ${result.town.name}, our nearest community. Call us and we'll point you in the right direction.`,
          };

  return (
    <div className={`mt-4 rounded-2xl p-4 ${tone.bg}`}>
      <p className="font-display text-lg text-charcoal">{tone.title}</p>
      <p className="mt-1 text-sm text-stone">{result.label}</p>
      <p className="mt-2 text-sm text-ink">{tone.body}</p>
      <div className="mt-3">
        {result.status === "in" ? (
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
