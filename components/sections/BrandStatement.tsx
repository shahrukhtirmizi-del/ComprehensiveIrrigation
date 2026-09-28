import { MorphingText } from "@/components/ui/MorphingText";

/** The one place the gooey word-morph appears: a full-width brand statement on solid brand green. */
export function BrandStatement() {
  return (
    <section aria-labelledby="statement-title" className="p-2 md:p-3">
      <div className="rounded-[1.75rem] px-4 py-24 text-center md:rounded-[2.25rem] md:py-36" style={{ background: "var(--brand-sampled, #2F5233)" }}>
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
