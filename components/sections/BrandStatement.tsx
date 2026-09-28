import { MorphingText } from "@/components/ui/MorphingText";

/**
 * The one place the gooey word-morph appears: a full-width brand statement on deep brand green,
 * given depth by grain, an edge vignette and three slowly drifting blurred accents (CSS only).
 */
export function BrandStatement() {
  return (
    <section aria-labelledby="statement-title" className="p-2 md:p-3">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-forest px-4 py-24 text-center md:rounded-[2.25rem] md:py-36">
        {/* Drifting accents */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="drift-a absolute -left-[10%] -top-[25%] h-[34rem] w-[34rem] rounded-full bg-leaf/30 blur-3xl" />
          <div className="drift-b absolute -bottom-[30%] -right-[8%] h-[30rem] w-[30rem] rounded-full bg-sand/25 blur-3xl" />
          <div className="drift-c absolute left-[38%] top-[35%] h-[22rem] w-[22rem] rounded-full bg-brand/35 blur-3xl" />
        </div>
        {/* Vignette + grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgb(8 12 7 / 0.55) 100%)" }}
        />
        <div aria-hidden className="ch-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.22] mix-blend-soft-light" />

        <h2 id="statement-title" className="sr-only">
          Our promise: save water, protect your lawn, prevent waste
        </h2>
        <p className="eyebrow !text-sand-soft">Don&apos;t waste water!!</p>
        <MorphingText
          className="mt-6"
          words={["SAVE WATER", "PROTECT YOUR LAWN", "PREVENT WASTE"]}
          color="#F7F4EE"
          textStyle={{ fontSize: "clamp(28px, 8.2vw, 120px)" }}
        />
        <p className="mx-auto mt-8 max-w-xl text-[1.02rem] leading-relaxed text-cream/75">
          Every repair, adjustment and schedule we set is measured against one question: is this water doing its job?
        </p>
      </div>
    </section>
  );
}
