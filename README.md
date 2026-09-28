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

**Hero.** `components/sections/Hero.tsx` feeds `ScrollExpandMedia`: while the centre image is collapsed, scrolling
grows it instead of moving the page; once it fills the frame, normal scrolling resumes. Swap `heroMedia` to
`{ type: "video", src: "/video/hero.mp4", poster: … }` for film. Visitors who prefer reduced motion, arrive on a
`/#section` link, or tab past the hero get it pre-expanded.

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
