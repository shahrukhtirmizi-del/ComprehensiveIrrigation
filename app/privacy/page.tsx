import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { business } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${business.legalName} collects, uses and protects your information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="September 27, 2026">
      <p>
        {business.legalName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy. This policy
        explains what information we collect through this website, how we use it, and the choices you have.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Information you give us.</strong> When you request a quote we collect your name, email address, phone
          number, property address, ZIP code, property type and the service you&apos;re interested in.
        </li>
        <li>
          <strong>Service-area checks.</strong> If you use the &ldquo;check your address&rdquo; tool, the text you enter is
          sent to OpenStreetMap&apos;s Nominatim geocoding service to find its location. We do not store it.
        </li>
        <li>
          <strong>Technical information.</strong> Like most websites, our hosting provider automatically records basic
          technical data such as IP address, browser type and pages visited, for security and reliability.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To respond to your quote request and communicate with you about our services.</li>
        <li>To schedule, perform and invoice work you ask us to carry out.</li>
        <li>To keep this website secure and working properly.</li>
      </ul>
      <p>We do not sell or rent your personal information.</p>

      <h2>Cookies and local storage</h2>
      <p>
        This site uses essential browser storage to remember preferences such as your cookie choice. If you accept
        optional cookies, we may use privacy-respecting analytics to understand how the site is used. You can change
        your choice at any time by clearing your browser&apos;s site data. The service-area map loads map tiles from
        CARTO and OpenStreetMap.
      </p>

      <h2>Sharing</h2>
      <p>
        We share information only with service providers who help us operate our business and this website (for
        example, website hosting and email delivery), and only as needed for them to provide that service — or where
        required by law.
      </p>

      <h2>Data retention and security</h2>
      <p>
        We keep quote requests and customer records for as long as needed to serve you and to meet our legal and
        accounting obligations. We use reasonable safeguards to protect your information, though no method of
        transmission over the internet is completely secure.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to access, correct or delete the personal information we hold about you, or to stop contacting
        you, by emailing <a href={`mailto:${business.email}`}>{business.email}</a> or calling{" "}
        <a href={business.phoneHref}>{business.phone}</a>.
      </p>

      <h2>Children</h2>
      <p>This website is not directed to children under 13 and we do not knowingly collect their information.</p>

      <h2>Changes</h2>
      <p>We may update this policy from time to time. The &ldquo;last updated&rdquo; date above shows the latest version.</p>

      <h2>Contact</h2>
      <p>
        {business.legalName}
        <br />
        <a href={business.phoneHref}>{business.phone}</a> · <a href={`mailto:${business.email}`}>{business.email}</a>
      </p>
    </LegalPage>
  );
}
