import { NextResponse } from "next/server";
import { business } from "@/lib/site";

/**
 * Geocoding proxy for the "check your address" tool: OpenStreetMap Nominatim (no API key),
 * called server-side with an identifying User-Agent as Nominatim's usage policy requires,
 * biased to Central Florida and cached for a day. One request per address check.
 */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 160);
  if (q.length < 3) return NextResponse.json({ error: "Enter a street address or ZIP code." }, { status: 400 });

  const query = /florida|,\s*fl\b/i.test(q) ? q : `${q}, Florida, USA`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("viewbox", "-82.1,28.6,-81.2,27.8");
  url.searchParams.set("q", query);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": `ComprehensiveIrrigationWebsite/1.0 (service-area check; ${business.email})`,
        "Accept-Language": "en",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    if (!data.length) return NextResponse.json({ result: null });
    const hit = data[0];
    return NextResponse.json({ result: { lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name } });
  } catch {
    return NextResponse.json({ error: "The address lookup is unavailable right now. Try a ZIP code, or call us." }, { status: 502 });
  }
}
