import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { business } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for using the ${business.legalName} website.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms & Conditions" updated="September 27, 2026">
      <p>
        These terms govern your use of this website, operated by {business.legalName}. By using the site you agree to
        them. If you don&apos;t agree, please don&apos;t use the site.
      </p>

      <h2>Quotes and services</h2>
      <p>
        Submitting a quote request does not create a contract or guarantee availability. Quotes are estimates based on
        the information provided and may change after an on-site assessment. The specific scope, price, schedule and
        terms of any work — including maintenance programs — are set out in the written estimate or agreement we
        provide to you, which takes precedence over anything on this website.
      </p>

      <h2>Water savings</h2>
      <p>
        Statements about water savings (for example, that irrigation repair can reduce up to 30% of water waste)
        describe potential outcomes. Actual results depend on your system&apos;s condition, property, weather, local
        watering restrictions and usage.
      </p>

      <h2>Licensing and insurance</h2>
      <p>
        {business.legalName} is fully licensed and insured (License {business.license}). Proof of insurance is
        available on request.
      </p>

      <h2>Payment</h2>
      <p>We accept {business.payments.join(", ")}. Payment terms are stated on your estimate or invoice.</p>

      <h2>Website content</h2>
      <p>
        We work to keep the information on this site accurate and up to date, but it is provided &ldquo;as is&rdquo;
        without warranties of any kind. Photographs are illustrative. Content, design and branding on this site belong
        to {business.legalName} or its licensors and may not be reused without permission.
      </p>

      <h2>Third-party services</h2>
      <p>
        The site links to or uses third-party services (such as map tiles and address lookup). We aren&apos;t
        responsible for their content or practices.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {business.legalName} is not liable for any indirect or consequential
        loss arising from your use of this website.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of Florida.</p>

      <h2>Contact</h2>
      <p>
        Questions? Call <a href={business.phoneHref}>{business.phone}</a> or email{" "}
        <a href={`mailto:${business.email}`}>{business.email}</a>.
      </p>
    </LegalPage>
  );
}
