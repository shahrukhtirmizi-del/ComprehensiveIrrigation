"use client";

import React, { useSyncExternalStore } from "react";
import { motion } from "motion/react";

// Reduced-motion preference, read so that hydration always matches the server render (which can't know it)
// and the page switches to the static layout straight after. useReducedMotion() read it during hydration
// and rendered a different number of cards than the server did.
const RM_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeRM = (onChange: () => void) => {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const usePrefersReducedMotion = () =>
  useSyncExternalStore(subscribeRM, () => window.matchMedia(RM_QUERY).matches, () => false);

type Testimonial = { text: string; initials: string; name: string; role: string };

// Verbatim reviews from comprehensiveirrigation.com — do not edit wording, spelling or grammar, and do not
// add invented quotes or stock faces here. Initials stand in for photos until real customer photos exist.
const testimonials: Testimonial[] = [
  { text: "Awesome Lawn Services, Always 5 star give them! thanks", initials: "KV", name: "Kristina Villalta", role: "Verified Customer" },
  {
    text: "Prompt wonderful service I highly recommend this company awesome customer service replied quickly to all my questions",
    initials: "TH",
    name: "Teena Hill",
    role: "Verified Customer",
  },
  { text: "Awesome Customer Service with good price!", initials: "LM", name: "Lola Mendez", role: "Verified Customer" },
  {
    text: "We are highly recommend! Amazing experience. Such a wonderful place! The staff was so nice, and the price for the services were great! Thanks.",
    initials: "FK",
    name: "Fred Kennedy",
    role: "Verified Customer",
  },
  { text: "Great Service! Excellent workmanship.", initials: "PL", name: "Pinoy Leads", role: "Verified Customer" },
];

// Each half of a scrolling column has to be taller than the 740px window, or the loop shows a gap.
const MIN_CARDS_PER_LOOP = 4;

const TestimonialsColumn = (props: { className?: string; testimonials: Testimonial[]; duration?: number; hidden?: boolean }) => {
  const reduce = usePrefersReducedMotion();
  const loop: Testimonial[] = [];
  while (loop.length < MIN_CARDS_PER_LOOP) loop.push(...props.testimonials);

  return (
    <div className={props.className} aria-hidden={props.hidden || undefined}>
      <motion.ul
        animate={reduce ? undefined : { translateY: "-50%" }}
        transition={{ duration: props.duration || 10, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(reduce ? 1 : 2)].map((_, copy) => (
          <React.Fragment key={copy}>
            {(reduce ? props.testimonials : loop).map(({ text, initials, name, role }, i) => (
              <li
                key={`${copy}-${i}`}
                // Only the first appearance of each review is announced; the rest are visual repeats for the loop.
                aria-hidden={copy > 0 || i >= props.testimonials.length || undefined}
                className="w-full max-w-xs rounded-3xl border border-[#e9efe3] bg-white p-8 shadow-lg shadow-[#1f3d2b]/5"
              >
                <figure>
                  <blockquote className="leading-relaxed text-[#2e5b3f]">{text}</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2e5b3f] text-sm font-semibold text-white"
                      aria-hidden
                    >
                      {initials}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-medium leading-5 tracking-tight text-[#1f3d2b]">{name}</span>
                      <span className="leading-5 tracking-tight text-[#3f7a52]">{role}</span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </React.Fragment>
        ))}
      </motion.ul>
    </div>
  );
};

export default function Testimonials() {
  const firstColumn = testimonials.slice(0, 2);
  const secondColumn = testimonials.slice(2, 4);
  const thirdColumn = testimonials.slice(4, 5).concat(testimonials.slice(0, 1));

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="bg-[#f6f2e8] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center text-center">
          <span className="rounded-lg border border-[#e9efe3] bg-white px-3 py-1 text-sm text-[#2e5b3f]">Testimonials</span>
          <h2 id="reviews-title" className="mt-5 text-4xl font-bold tracking-tight text-[#1f3d2b] sm:text-5xl">
            What our customers say
          </h2>
          <p className="mt-4 max-w-md text-[#3f7a52]">Real reviews from Central Florida customers, word for word.</p>
        </div>
        <div className="relative mt-12 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} duration={19} className="hidden md:block" />
          {/* The third column repeats reviews already announced above, so it's hidden from screen readers. */}
          <TestimonialsColumn testimonials={thirdColumn} duration={17} className="hidden lg:block" hidden />
        </div>
      </div>
    </section>
  );
}
