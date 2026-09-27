import { QuoteMarkIcon } from "@/components/ui/Icons";

// Verbatim customer reviews — do not edit wording.
const testimonials = [
  { name: "Kristina Villalta", quote: "Awesome Lawn Services, Always 5 star give them! thanks" },
  {
    name: "Teena Hill",
    quote: "Prompt wonderful service I highly recommend this company awesome customer service replied quickly to all my questions",
  },
  { name: "Lola Mendez", quote: "Awesome Customer Service with good price!" },
  {
    name: "Fred Kennedy",
    quote:
      "We are highly recommend! Amazing experience. Such a wonderful place! The staff was so nice, and the price for the services were great! Thanks.",
  },
  { name: "Pinoy Leads", quote: "Great Service! Excellent workmanship." },
];

function Card({ name, quote }: { name: string; quote: string }) {
  return (
    <figure className="flex h-full w-[19rem] shrink-0 flex-col justify-between rounded-[1.5rem] bg-white p-7 shadow-[var(--shadow-soft)] transition-[translate,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] sm:w-[23rem]">
      <div>
        <QuoteMarkIcon className="h-7 w-7 text-sand" />
        <blockquote className="mt-4 font-display text-[1.25rem] leading-snug text-charcoal">{quote}</blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-mist font-display text-forest" aria-hidden>
          {name.charAt(0)}
        </span>
        <span className="text-sm font-bold text-charcoal">{name}</span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="overflow-hidden py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow" data-reveal>
              Reviews
            </p>
            <h2 id="reviews-title" data-split className="mt-4 font-display text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.02] text-charcoal">
              In our customers&apos; <em className="italic text-forest">own words.</em>
            </h2>
          </div>
          <p className="text-[1.02rem] leading-relaxed text-stone md:col-span-5 md:pb-2" data-reveal>
            Real reviews from customers across Central Florida. Hover to pause.
          </p>
        </div>
      </div>

      <div className="marquee relative mt-14" data-reveal>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-cream to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-cream to-transparent md:w-32" />
        <div className="marquee-track flex w-max py-4">
          <ul className="flex gap-5 pr-5" data-stagger="0.15">
            {testimonials.map((t) => (
              <li key={t.name}>
                <Card {...t} />
              </li>
            ))}
          </ul>
          {/* Duplicate set for a seamless loop — hidden from assistive tech. */}
          <ul className="flex gap-5 pr-5" aria-hidden>
            {testimonials.map((t) => (
              <li key={t.name}>
                <Card {...t} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
