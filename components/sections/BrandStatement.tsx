import { MorphingText } from "@/components/ui/MorphingText";

/**
 * "Protect Your Lawn": full-width brand statement. Layered radial green, film grain and three slowly
 * drifting blurred blobs (CSS only — see .protect / .blob in globals.css) behind the gooey word-morph.
 */
export function BrandStatement() {
  return (
    <section aria-labelledby="statement-title" className="p-2 md:p-3">
      <div className="protect rounded-[1.75rem] md:rounded-[2.25rem]">
        <div className="blob blob1" aria-hidden="true" />
        <div className="blob blob2" aria-hidden="true" />
        <div className="blob blob3" aria-hidden="true" />

        <h2 id="statement-title" className="sr-only">
          Our promise: save water, protect your lawn, prevent waste
        </h2>
        <p className="eyebrow !text-sand">Don&apos;t waste water!!</p>
        <MorphingText
          className="mt-6"
          words={["SAVE WATER", "PROTECT YOUR LAWN", "PREVENT WASTE"]}
          color="#f6f2e8"
          textStyle={{ fontSize: "clamp(28px, 8.2vw, 120px)" }}
        />
        <p className="mx-auto mt-8 max-w-xl text-[1.02rem] leading-relaxed text-cream/75">
          Leaking valves, cracked heads and zones watering the sidewalk quietly pour money down the drain. We find them,
          fix them, and set your system to use only what your lawn needs.
        </p>
      </div>
    </section>
  );
}
