"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

type Testimonial = { text: string; initials: string; name: string; role: string };

// Verbatim reviews from comprehensiveirrigation.com — do not edit wording, spelling or grammar.
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

const TestimonialsColumn = (props: { className?: string; testimonials: Testimonial[]; duration?: number; hidden?: boolean }) => {
  const reduce = useReducedMotion();
  return (
    <div className={props.className} aria-hidden={props.hidden || undefined}>
      <motion.ul
        animate={reduce ? undefined : { translateY: "-50%" }}
        transition={{ duration: props.duration || 10, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(reduce ? 1 : 2)].map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, initials, name, role }, i) => (
              <li
                key={`${index}-${i}`}
                aria-hidden={index > 0 || undefined}
                className="w-full max-w-xs rounded-[1.75rem] bg-white p-8 shadow-[var(--shadow-soft)] ring-1 ring-black/5"
              >
                <figure>
                  <blockquote className="font-display text-[1.15rem] leading-snug text-charcoal">{text}</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ background: "var(--brand-sampled, #2F5233)" }}
                      aria-hidden
                    >
                      {initials}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-bold leading-5 tracking-tight text-charcoal">{name}</span>
                      <span className="text-sm leading-5 tracking-tight text-stone">{role}</span>
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
    <section id="reviews" aria-labelledby="reviews-title" className="bg-parchment py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-col items-center text-center">
          <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-forest shadow-[var(--shadow-soft)]">
            Testimonials
          </span>
          <h2 id="reviews-title" data-split className="mt-5 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] text-charcoal">
            What Central Florida homeowners <em className="text-forest">say</em>
          </h2>
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
