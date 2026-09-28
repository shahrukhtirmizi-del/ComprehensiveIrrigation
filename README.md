# Comprehensive Irrigation and Lawn Services — website

Marketing and quote-request site for Comprehensive Irrigation and Lawn Services, LLC (Davenport, Champions Gate,
Celebration, Haines City and Four Corners, FL). Built with Next.js (App Router), Tailwind CSS v4, GSAP and Lenis.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (also fetches the logo — see below)
npm run lint && npm run typecheck
```

## Things to know

**Logo, favicon and brand green.** `scripts/fetch-logo.mjs` runs before every build. It downloads the official logo from
`comprehensiveirrigation.com`, generates favicon sizes into `public/brand/`, and samples the badge's green into
`app/brand-color.generated.css` (the `--brand-sampled` variable every green on the site derives from). If the download
fails, the build still succeeds: the green falls back to `#2F5233` and `next.config.ts` proxies the logo from the live site.

**Quote form delivery.** Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` + `QUOTE_TO_EMAIL` | Email each request via [Resend](https://resend.com). `QUOTE_FROM_EMAIL` optional (needs a verified domain). |
| `QUOTE_WEBHOOK_URL` | POST each request as JSON to Zapier / Make / a CRM. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO, e.g. `https://comprehensiveirrigation.com`. Defaults to the Vercel production URL. |

Form fields: name, phone, email, service address, service needed, preferred contact method, message.
With no delivery channel configured, requests are written to the server log (Vercel → Logs) so nothing is lost.

**Hero.** `components/sections/Hero.tsx`: a cinematic still (`heroMedia`) under gradient + grain overlays, a
pull-up "Comprehensive" headline and a hover-reveal quote CTA. To use film later, swap the `<img>` for a `<video>`.

**Menu.** `components/layout/DrapeMenu.tsx`: the "Menu" toggle lives in the header bar; the cream SVG drape falls
under the bar (so the real logo and "Close" stay on top) with the link letters sliding in. Links are the `LINKS` array.

**Typography.** Bricolage Grotesque for display (bold, tracking −0.05em on h1/h2), DM Sans for body — both loaded with
`next/font` in `app/layout.tsx`. Headline accent words are set in colour, not italic (Bricolage has no italic).

**Service-area map.** react-leaflet over OpenStreetMap's standard tiles (no API key), tinted to the palette in
`app/globals.css` (`.service-map .leaflet-tile-pane`). The boundary polygon and town pins live in `lib/areas.ts`.
Address checks go through `/api/geocode`, a small server-side proxy to OpenStreetMap Nominatim (also keyless).
Both OSM services are free for light use; if traffic grows, point the `TileLayer` URL at a commercial tile host.

**Our Work gallery.** `components/OurWorkGallery.tsx` draws the photos through a WebGL "lens" that stretches them
toward the frame edges as they scroll past; tapping a photo opens a drag/swipe viewer. Photos and captions are the
`works` array at the top of the file.

## Structure

- `app/` — routes (`/`, `/privacy`, `/terms`, 404, `sitemap.xml`, `robots.txt`, `api/quote`)
- `components/sections/` — page sections
- `components/providers/` — smooth scroll (Lenis) and scroll-driven motion (`data-reveal`, `data-split`, `data-stagger`)
- `lib/` — business details, services, service area, form validation
- `public/images/` — photography
