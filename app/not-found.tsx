import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/lib/site";
import { ArrowRightIcon, DropIcon, PhoneIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="p-2 md:p-3">
      <div className="flex min-h-[calc(100svh-1rem)] items-center justify-center rounded-[1.75rem] bg-parchment px-6 py-32 text-center md:rounded-[2.25rem]">
        <div className="max-w-xl">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-forest shadow-[var(--shadow-soft)]">
            <DropIcon className="h-7 w-7" />
          </span>
          <p className="eyebrow mt-8">Error 404</p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,4.8rem)] leading-[1] text-charcoal">
            This page <em className="italic text-forest">dried up.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[1.05rem] leading-relaxed text-stone">
            The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to greener ground.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary">
              Back to home <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a href={business.phoneHref} className="btn btn-outline-dark">
              <PhoneIcon className="h-4 w-4" /> {business.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
