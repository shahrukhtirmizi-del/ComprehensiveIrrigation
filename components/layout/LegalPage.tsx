import type { ReactNode } from "react";

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: ReactNode }) {
  return (
    <div className="pb-24 pt-36 md:pb-32 md:pt-44">
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.02] text-charcoal">{title}</h1>
          <p className="mt-4 text-sm text-stone">Last updated {updated}</p>
          <div className="mt-10 rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-10 md:p-12">
            <div className="space-y-5 text-[1rem] leading-relaxed text-ink [&_a]:font-semibold [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2 [&_h2]:pt-5 [&_h2]:font-display [&_h2]:text-[1.6rem] [&_h2]:leading-tight [&_h2]:text-charcoal [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
