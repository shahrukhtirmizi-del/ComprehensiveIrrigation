import Image from "next/image";
import { CountUp } from "@/components/ui/CountUp";
import { ArrowRightIcon, PhoneIcon, ShieldIcon } from "@/components/ui/Icons";
import { business } from "@/lib/site";

/**
 * heroMedia — swap this for `{ type: "video", src: "/video/hero.mp4", poster: "/images/estate-landscape-sunset.jpg" }`
 * when the hero film is ready. Nothing else in the hero needs to change.
 */
export type HeroMedia =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; poster: string; alt: string };

export const heroMedia: HeroMedia = {
  type: "image",
  src: "/images/estate-landscape-sunset.jpg",
  alt: "Manicured green lawn and palm-lined Florida home glowing at sunset",
};

function HeroMediaLayer({ media }: { media: HeroMedia }) {
  if (media.type === "video") {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={media.src}
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        aria-label={media.alt}
      />
    );
  }
  return (
    <div className="ken-burns absolute inset-0">
      <Image src={media.src} alt={media.alt} fill priority sizes="100vw" className="object-cover" quality={82} />
    </div>
  );
}

const stats = [
  { kind: "count" as const, to: 25, suffix: "+", label: "Years in Business" },
  { kind: "text" as const, value: "Licensed & Insured", label: `License ${business.license}` },
  { kind: "count" as const, to: 30, prefix: "Up to ", suffix: "%", label: "Less Water Waste" },
  { kind: "count" as const, to: 5, label: "Communities Served Across Central Florida" },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="p-2 md:p-3">
      <div className="relative isolate flex min-h-[calc(100svh-1rem)] flex-col overflow-hidden rounded-[1.75rem] bg-charcoal md:min-h-[calc(100svh-1.5rem)] md:rounded-[2.25rem]">
        {/* heroMedia slot */}
        <div className="absolute inset-0 -z-10">
          <HeroMediaLayer media={heroMedia} />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/20 to-charcoal/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-charcoal/10 to-transparent" />
        </div>

        <div className="container-x flex flex-1 flex-col justify-end pb-8 pt-32 md:pb-10 md:pt-40">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md" data-reveal>
              <span className="h-1.5 w-1.5 rounded-full bg-sand" />
              Irrigation &amp; Lawn · Central Florida
            </p>
            <h1
              id="hero-title"
              data-split="load"
              className="mt-6 font-display text-[clamp(3.2rem,10vw,7.75rem)] font-medium leading-[0.92] tracking-[-0.035em] text-white"
            >
              Every Drop <em className="font-light italic text-sand-soft">Counts.</em>
            </h1>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/80 md:text-lg" data-reveal data-reveal-delay="0.35">
              25+ years of irrigation and lawn care for Champions Gate, Celebration, Haines City, Davenport, and Four
              Corners, FL — licensed, insured, and built to save you water and money.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-reveal data-reveal-delay="0.5">
              <a href="#quote" className="btn btn-primary !bg-brand !px-7 !py-[1.05rem] text-base">
                Get a Free Quote <ArrowRightIcon className="h-4 w-4" />
              </a>
              <a href={business.phoneHref} className="btn btn-ghost !px-7 !py-[1.05rem] text-base">
                <PhoneIcon className="h-4 w-4" /> {business.phone}
              </a>
            </div>
          </div>

          <ul
            className="mt-12 grid grid-cols-2 gap-2 md:mt-16 md:grid-cols-4 md:gap-3"
            aria-label="Why homeowners choose us"
            data-stagger="0.12"
          >
            {stats.map((s) => (
              <li
                key={s.label}
                className="rounded-[1.25rem] bg-white/10 px-4 py-4 text-white ring-1 ring-white/15 backdrop-blur-md md:px-5 md:py-5"
              >
                <p className="font-display text-[1.6rem] leading-none md:text-[2.1rem]">
                  {s.kind === "count" ? (
                    <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} delay={0.6} />
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[1.2rem] md:text-[1.45rem]">
                      <ShieldIcon className="h-6 w-6 text-sand" /> {s.value}
                    </span>
                  )}
                </p>
                <p className="mt-2 text-[0.8rem] leading-snug text-white/70 md:text-sm">{s.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
