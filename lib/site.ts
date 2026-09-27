export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://comprehensiveirrigation.com")
).replace(/\/$/, "");

export const business = {
  name: "Comprehensive Irrigation and Lawn Services",
  legalName: "Comprehensive Irrigation and Lawn Services, LLC",
  shortName: "Comprehensive Irrigation",
  tagline: "Don't Waste Water!!",
  phone: "(321) 285-6608",
  phoneHref: "tel:+13212856608",
  phoneE164: "+13212856608",
  email: "info@comprehensiveirrigation.com",
  license: "SCC 131152213",
  yearsInIndustry: 25,
  logo: "/brand/logo.png",
  hours: [
    { days: "Monday – Friday", time: "7:00 AM – 5:00 PM" },
    { days: "Saturday", time: "7:00 AM – 3:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  payments: ["MasterCard", "VISA", "American Express", "Discover", "Check", "Cash"],
  communities: ["Champions Gate", "Celebration", "Haines City", "Davenport", "Four Corners"],
  verifications: ["Google", "HomeAdvisor", "Facebook", "Yelp"],
  sameAs: [
    "https://www.facebook.com/comprehensiveirrigation/",
    "https://www.yelp.com/biz/comprehensive-irrigation-and-lawn-services-davenport",
  ],
} as const;

export const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#maintenance", label: "Maintenance Program" },
  { href: "/#results", label: "Results" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#service-area", label: "Service Area" },
] as const;
