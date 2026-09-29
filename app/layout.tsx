import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { MotionController } from "@/components/providers/MotionController";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { SITE_URL, business } from "@/lib/site";

// Inter for the whole site; DM Sans only for the split-reveal hero. Both self-hosted from Google Fonts by next/font.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "900"],
  display: "swap",
});

const title = "Irrigation & Lawn Care in Davenport, FL | Comprehensive Irrigation";
const description =
  "Licensed & insured irrigation repair, sprinkler maintenance and lawn care serving Davenport, Champions Gate, Celebration, Haines City and Four Corners, FL. 25+ years' experience. Free quotes — (321) 285-6608.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | ${business.shortName}` },
  description,
  applicationName: business.name,
  keywords: [
    "irrigation repair Davenport FL",
    "sprinkler repair Champions Gate",
    "lawn care Celebration FL",
    "irrigation maintenance Haines City",
    "lawn service Four Corners FL",
    "palm tree care Davenport",
    "landscape lighting Central Florida",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: business.name,
    title,
    description,
    images: [
      {
        url: "/images/hero-sunset-lake-home.jpg",
        width: 1672,
        height: 941,
        alt: "Landscaped Florida home and lawn at sunset with a lake behind",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/hero-sunset-lake-home.jpg"],
  },
  icons: {
    icon: [
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: { telephone: true, email: true, address: false },
  robots: { index: true, follow: true },
  other: {
    "geo.region": "US-FL",
    "geo.placename": "Davenport",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f2e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={`${inter.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available so reveal animations can hide content up-front without hurting no-JS visitors,
            and decides before first paint whether the homepage intro should be skipped (already seen this
            session, reduced motion, or a deep link like /#quote) so its overlay never flashes. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('ci-intro-seen')||location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('intro-skip')}catch(e){}})()",
          }}
        />
        <LocalBusinessJsonLd />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-bold focus:shadow-lg"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MotionController />
          <CookieConsent />
        </SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
