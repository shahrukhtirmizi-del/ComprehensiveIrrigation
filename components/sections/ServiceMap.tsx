"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { SERVICE_POLYGON, towns, type CoverageStatus, type Town } from "@/lib/areas";

export type MapCheck = { lat: number; lng: number; status: CoverageStatus; town: Town; label: string };

const pinIcon = (active: boolean) =>
  L.divIcon({ className: `map-pin${active ? " is-active" : ""}`, html: "<span></span>", iconSize: [26, 26], iconAnchor: [13, 13] });
const checkIcon = (status: CoverageStatus) =>
  L.divIcon({ className: `map-pin map-pin-you${status === "in" ? "" : " is-out"}`, html: "<span></span>", iconSize: [26, 26], iconAnchor: [13, 13] });

const BOUNDS = L.latLngBounds(SERVICE_POLYGON.map(([lat, lng]) => L.latLng(lat, lng)));

/** Drives the camera from outside state: fly to the active town or to a checked address. */
function CameraController({ activeTown, check }: { activeTown: string | null; check: MapCheck | null }) {
  const map = useMap();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (check) {
      map.closePopup();
      const b = L.latLngBounds([L.latLng(check.lat, check.lng), L.latLng(check.town.lat, check.town.lng)]);
      map.flyToBounds(b.pad(check.status === "in" ? 1.4 : 0.4), { duration: 1.3, maxZoom: 12 });
    }
  }, [check, map]);

  useEffect(() => {
    if (!activeTown || check) return;
    const t = towns.find((x) => x.id === activeTown);
    if (t) map.flyTo([t.lat, t.lng], 11.5, { duration: 1.1 });
  }, [activeTown, check, map]);

  return null;
}

export default function ServiceMap({
  activeTown,
  onTownSelect,
  check,
}: {
  activeTown: string | null;
  onTownSelect: (id: string | null) => void;
  check: MapCheck | null;
}) {
  const brand = useMemo(
    () => (typeof window === "undefined" ? "#2F5233" : getComputedStyle(document.documentElement).getPropertyValue("--brand-sampled").trim() || "#2F5233"),
    [],
  );
  const markers = useRef<Record<string, L.Marker | null>>({});

  // Open the chosen town's popup once the camera has arrived.
  useEffect(() => {
    if (!activeTown || check) return;
    const id = window.setTimeout(() => markers.current[activeTown]?.openPopup(), 1000);
    return () => window.clearTimeout(id);
  }, [activeTown, check]);

  return (
    <MapContainer
      bounds={BOUNDS.pad(0.08)}
      zoomSnap={0.25}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl
      className="h-full w-full"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ZoomButtons />

      <Polygon
        positions={SERVICE_POLYGON}
        pathOptions={{ color: brand, weight: 2, opacity: 0.8, dashArray: "6 8", fillColor: brand, fillOpacity: 0.13 }}
      />

      {towns.map((t) => (
        <Marker
          key={t.id}
          position={[t.lat, t.lng]}
          icon={pinIcon(activeTown === t.id)}
          title={`${t.name}, FL`}
          alt={`${t.name}, FL`}
          keyboard
          ref={(m) => {
            markers.current[t.id] = m;
          }}
          eventHandlers={{
            click: () => onTownSelect(t.id),
            mouseover: (e) => e.target.openPopup(),
          }}
        >
          <Tooltip direction="top" offset={[0, -14]} className="town-tip">
            {t.name}
          </Tooltip>
          <Popup closeButton={false} offset={[0, -8]}>
            <p className="map-popup-title">{t.name}, FL</p>
            <p className="map-popup-body">{t.blurb}</p>
            <Link className="map-popup-link" href="/#quote">
              Get a free quote &rarr;
            </Link>
          </Popup>
        </Marker>
      ))}

      {check && (
        <>
          <Polyline
            positions={[
              [check.lat, check.lng],
              [check.town.lat, check.town.lng],
            ]}
            pathOptions={{ color: check.status === "in" ? brand : "#c9a876", weight: 2, dashArray: "4 8", opacity: 0.9 }}
          />
          <Marker position={[check.lat, check.lng]} icon={checkIcon(check.status)} zIndexOffset={1000} title="Your address">
            <Tooltip permanent direction="top" offset={[0, -16]} className="town-tip">
              {check.status === "in" ? "You're covered" : check.status === "near" ? "Just outside" : "Outside our area"}
            </Tooltip>
          </Marker>
        </>
      )}

      <CameraController activeTown={activeTown} check={check} />
    </MapContainer>
  );
}

function ZoomButtons() {
  const map = useMap();
  const ref = useRef<HTMLDivElement>(null);
  // Keep clicks and wheel on the controls from also panning / zooming the map underneath.
  useEffect(() => {
    if (!ref.current) return;
    L.DomEvent.disableClickPropagation(ref.current);
    L.DomEvent.disableScrollPropagation(ref.current);
  }, []);
  return (
    <div ref={ref} className="map-zoom" role="group" aria-label="Map zoom">
      <button type="button" aria-label="Zoom in" onClick={() => map.zoomIn()}>
        +
      </button>
      <button type="button" aria-label="Zoom out" onClick={() => map.zoomOut()}>
        &minus;
      </button>
      <button type="button" aria-label="Show the whole service area" onClick={() => map.flyToBounds(BOUNDS.pad(0.08), { duration: 1 })}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
      </button>
    </div>
  );
}
