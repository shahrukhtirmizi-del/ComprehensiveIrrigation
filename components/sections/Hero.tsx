import { preload } from "react-dom";
import ScrollExpandMedia from "./ScrollExpandMedia";
import { CountUp } from "@/components/ui/CountUp";
import { ArrowRightIcon, DropIcon, PhoneIcon, ShieldIcon } from "@/components/ui/Icons";
import { business } from "@/lib/site";

/**
 * heroMedia — the collapsed-then-expanding centrepiece and the backdrop behind it.
 * To switch to film later: `{ type: "video", src: "/video/hero.mp4", poster: "/images/hero-sprinkler-golden-hour.jpg", … }`.
 */
export const heroMedia = {
  type: "image" as "image" | "video",
  src: "/images/hero-sprinkler-golden-hour.jpg",
  alt: "Pop-up sprinkler spraying across a dewy lawn at golden hour, backlit by the setting sun and palm silhouettes",
  poster: undefined as string | undefined,
  background: "/images/hero-sunset-lake-home.jpg",
};

const facts = [
  {
    icon: <span className="font-display text-[2.4rem] leading-none md:text-[2.9rem]"><CountUp to={25} suffix="+" /></span>,
    title: "Years in the green industry",
    body: "Irrigation and lawn care across Central Florida since long before smart controllers.",
  },
  {
    icon: <ShieldIcon className="h-10 w-10" />,
    title: "Licensed & insured",
    body: `Florida license ${business.license}. Official Grounds Guys Partner.`,
  },
  {
    icon: <span className="font-display text-[2.4rem] leading-none md:text-[2.9rem]"><CountUp to={30} prefix="" suffix="%" /></span>,
    title: "Less water waste",
    body: "Irrigation repair reduces up to 30% of water waste.",
  },
];

export function Hero() {
  // Both hero images are visible on first paint, so fetch them ahead of the JS.
  preload(heroMedia.background, { as: "image", fetchPriority: "high" });
  if (heroMedia.type === "image") preload(heroMedia.src, { as: "image", fetchPriority: "high" });
  return (
    <ScrollExpandMedia
      mediaType={heroMedia.type}
      mediaSrc={heroMedia.src}
      mediaAlt={heroMedia.alt}
      posterSrc={heroMedia.poster}
      bgImageSrc={heroMedia.background}
      title="Every Drop Counts."
      textBlend
    >
      <div className="container-x !px-0">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow inline-flex items-center gap-2">
              <DropIcon className="h-4 w-4" /> Don&apos;t waste water
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,4.6vw,3.9rem)] leading-[1.02] text-charcoal">
              25+ years of irrigation and lawn care, built to <em className="italic text-forest">save you water</em> and money.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[1.05rem] leading-relaxed text-stone md:text-lg">
              Serving Champions Gate, Celebration, Haines City, Davenport and Four Corners, FL. Licensed &amp; insured
              ({business.license}).
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#quote" className="btn btn-primary !px-7 !py-[1.05rem] text-base">
                Get a Free Quote <ArrowRightIcon className="h-4 w-4" />
              </a>
              <a href={business.phoneHref} className="btn btn-outline-dark !px-7 !py-[1.05rem] text-base">
                <PhoneIcon className="h-4 w-4" /> {business.phone}
              </a>
            </div>
          </div>
        </div>

        <ul className="mt-12 grid gap-3 md:grid-cols-3 md:gap-4" aria-label="Why homeowners choose us">
          {facts.map((f) => (
            <li key={f.title} className="rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-soft)] md:p-7">
              <div className="flex h-12 items-center text-forest">{f.icon}</div>
              <p className="mt-5 font-display text-[1.35rem] leading-tight text-charcoal">{f.title}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-stone">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </ScrollExpandMedia>
  );
}
