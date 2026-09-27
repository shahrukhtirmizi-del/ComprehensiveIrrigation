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

With no delivery channel configured, requests are written to the server log (Vercel → Logs) so nothing is lost.

**Hero video.** Change `heroMedia` in `components/sections/Hero.tsx` to
`{ type: "video", src: "/video/hero.mp4", poster: "/images/estate-landscape-sunset.jpg", alt: "…" }`.

**Address checker.** Known local ZIPs resolve instantly; other addresses are geocoded with OpenStreetMap Nominatim
(free, rate-limited). Service radius is set in `lib/areas.ts`.

## Structure

- `app/` — routes (`/`, `/privacy`, `/terms`, 404, `sitemap.xml`, `robots.txt`, `api/quote`)
- `components/sections/` — page sections
- `components/providers/` — smooth scroll (Lenis) and scroll-driven motion (`data-reveal`, `data-split`, `data-stagger`)
- `lib/` — business details, services, service area, form validation
- `public/images/` — photography
