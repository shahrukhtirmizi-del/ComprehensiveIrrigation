export type Service = {
  name: string;
  summary: string;
  highlight?: string;
};

export type ServiceCategory = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  image: { src: string; alt: string };
  services: Service[];
};

export const serviceCategories: ServiceCategory[] = [
  {
    id: "irrigation",
    eyebrow: "01 — Water",
    title: "Irrigation & Water Management",
    intro:
      "A healthy Florida lawn starts underground. We keep every zone, head and controller doing exactly what it should — and nothing it shouldn't.",
    image: {
      src: "/images/sprinklers-golden-hour-lawn.jpg",
      alt: "Pop-up sprinklers watering a lush lawn at golden hour in front of a Florida home",
    },
    services: [
      {
        name: "Irrigation Repair",
        highlight: "Up to 30% less water waste",
        summary:
          "Irrigation repair can reduce up to 30% of water waste. We track down leaks, broken heads, faulty valves and pressure problems, then fix them properly.",
      },
      {
        name: "Irrigation Maintenance",
        summary:
          "Cleaning filters, nozzles and lines, calibrating controllers and timers, and inspecting valves, pipes and fittings so water goes where it's needed.",
      },
      {
        name: "Sprinkler System Repair & Optimization",
        summary:
          "Head adjustments, coverage checks, seasonal scheduling and efficiency upgrades like smart controllers, drip zones and rain sensors.",
      },
    ],
  },
  {
    id: "lawn",
    eyebrow: "02 — Turf",
    title: "Lawn Care",
    intro:
      "Consistent, professional care for homes and commercial properties — the kind of lawn that makes the whole street look better.",
    image: {
      src: "/images/lawn-technician-mowing.jpg",
      alt: "Lawn care technician mowing clean stripes into a green lawn in front of a Florida home",
    },
    services: [
      {
        name: "Residential Lawn Care",
        summary: "Mowing, edging, trimming and seasonal care on a schedule that suits your home and your yard.",
      },
      {
        name: "Commercial Lawn Care",
        summary: "Reliable, presentable grounds for businesses, HOAs and communities — handled by one accountable crew.",
      },
      {
        name: "Commercial Landscape & Maintenance",
        summary: "Ongoing landscape upkeep for commercial properties, from beds and shrubs to turf and irrigation.",
      },
    ],
  },
  {
    id: "specialized",
    eyebrow: "03 — Detail",
    title: "Specialized Services",
    intro:
      "The finishing work that turns a tidy yard into a property people slow down to look at — day and night.",
    image: {
      src: "/images/palm-tree-trimming.jpg",
      alt: "Arborist in a safety harness trimming a tall palm tree against a blue sky",
    },
    services: [
      { name: "Landscape Design", summary: "Planting plans and layouts designed around Central Florida's climate and your property." },
      { name: "Palm Tree Care", summary: "Safe, professional palm trimming and care to keep palms healthy and looking their best." },
      { name: "Pest Control", summary: "Targeted treatment to protect your lawn and landscape from damaging pests." },
      { name: "Pressure Washing", summary: "Driveways, walkways and hardscapes cleaned back to their original finish." },
      { name: "Professional Outdoor Lighting", summary: "Landscape lighting that highlights your home and plantings after dark." },
    ],
  },
];

export const serviceOptions = [
  ...serviceCategories.flatMap((c) => c.services.map((s) => s.name)),
  "Maintenance Program",
  "Not sure — I'd like advice",
];
