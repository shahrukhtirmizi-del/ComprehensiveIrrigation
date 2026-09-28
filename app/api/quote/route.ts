import { NextResponse } from "next/server";
import { contactMethods, validateQuote, type ContactMethod, type QuoteInput, type QuoteService } from "@/lib/quote";
import { business } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Quote request delivery. Configure one (or both) in Vercel → Project → Settings → Environment Variables:
 *
 *   RESEND_API_KEY   + QUOTE_TO_EMAIL (+ optional QUOTE_FROM_EMAIL)  → emails each request via Resend
 *   QUOTE_WEBHOOK_URL                                                → POSTs each request as JSON
 *                                                                      (Zapier, Make, HubSpot, a CRM, Slack…)
 *
 * With neither set, requests are written to the server log (Vercel → Logs) so nothing is lost.
 */

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function sendEmail(q: QuoteInput) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  if (!key || !to) return false;
  const rows = Object.entries({
    Name: q.name,
    Phone: q.phone,
    Email: q.email,
    "Service address": q.address,
    "Service needed": q.service,
    "Preferred contact": q.contactMethod,
    Message: q.message || "—",
  })
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#62665d">${k}</td><td style="padding:6px 12px;white-space:pre-wrap"><strong>${escape(v)}</strong></td></tr>`)
    .join("");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.QUOTE_FROM_EMAIL ?? `${business.shortName} Website <onboarding@resend.dev>`,
      to: to.split(",").map((s) => s.trim()),
      reply_to: q.email,
      subject: `New quote request: ${q.service} — ${q.name}`,
      html: `<h2 style="font-family:Georgia,serif">New quote request</h2><table>${rows}</table>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  return true;
}

async function sendWebhook(q: QuoteInput) {
  const url = process.env.QUOTE_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...q, source: "website-quote-form", submittedAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please call us instead." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Honeypot: bots fill every field. Pretend success, deliver nothing.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const str = (k: string, max = 200) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const method = str("contactMethod");
  const quote: QuoteInput = {
    name: str("name"),
    phone: str("phone"),
    email: str("email"),
    address: str("address"),
    service: str("service") as QuoteService,
    contactMethod: ((contactMethods as readonly string[]).includes(method) ? method : "Phone call") as ContactMethod,
    message: str("message", 1200),
  };

  const errors = validateQuote(quote);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const results = await Promise.allSettled([sendEmail(quote), sendWebhook(quote)]);
  const delivered = results.some((r) => r.status === "fulfilled" && r.value);
  const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  failures.forEach((f) => console.error("[quote] Delivery channel failed:", f.reason));

  if (delivered) return NextResponse.json({ ok: true });
  if (failures.length) {
    console.error("[quote] Undelivered request:", JSON.stringify(quote));
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  console.info("[quote] New request (no delivery channel configured):", JSON.stringify(quote));
  return NextResponse.json({ ok: true });
}
