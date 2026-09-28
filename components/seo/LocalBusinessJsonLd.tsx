import { SITE_URL, business } from "@/lib/site";
import { serviceCategories } from "@/lib/services";
import { towns } from "@/lib/areas";

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
        "@id": `${SITE_URL}/#business`,
        name: business.name,
        legalName: business.legalName,
        slogan: business.tagline,
        description:
          "Irrigation repair and maintenance, sprinkler optimization, residential and commercial lawn care, landscape design, palm tree care, pest control, pressure washing and outdoor lighting. Over 25 years in the green industry. Fully licensed and insured.",
        url: SITE_URL,
        logo: `${SITE_URL}${business.logo}`,
        image: [`${SITE_URL}/images/hero-sunset-lake-home.jpg`, `${SITE_URL}/images/about-crew-truck.jpg`],
        telephone: business.phoneE164,
        email: business.email,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Davenport",
          addressRegion: "FL",
          addressCountry: "US",
        },
        areaServed: towns.map((t) => ({
          "@type": "City",
          name: `${t.name}, FL`,
          geo: { "@type": "GeoCoordinates", latitude: t.lat, longitude: t.lng },
        })),
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "07:00",
            closes: "17:00",
          },
          { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "07:00", closes: "15:00" },
        ],
        paymentAccepted: "MasterCard, VISA, American Express, Discover, Check, Cash",
        currenciesAccepted: "USD",
        hasCredential: {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "license",
          name: `Florida contractor license ${business.license}`,
        },
        knowsAbout: ["Irrigation repair", "Sprinkler systems", "Lawn care", "Water conservation", "Landscape maintenance"],
        sameAs: business.sameAs,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Irrigation & Lawn Services",
          itemListElement: serviceCategories.map((cat) => ({
            "@type": "OfferCatalog",
            name: cat.title,
            itemListElement: cat.services.map((s) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: s.name, description: s.summary },
            })),
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: business.name,
        publisher: { "@id": `${SITE_URL}/#business` },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
