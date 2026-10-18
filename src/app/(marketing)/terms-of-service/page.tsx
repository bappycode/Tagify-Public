import type { Metadata } from "next";

import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that govern your use of Tagify.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="May 25, 2026"
      intro="By using Tagify you agree to these terms. Please read them carefully."
    >
      <LegalSection title="1. The service">
        <p>
          Tagify provides hosted server-side tracking infrastructure, including managed sGTM
          containers, Gateway workspaces, dashboards, and integrations with third-party advertising
          platforms.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and
          API keys, and for all activity under your account. Notify us immediately of unauthorized
          use.
        </p>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        <ul className="list-disc space-y-2 pl-6">
          <li>No unlawful, infringing, or harmful content or events</li>
          <li>No attempts to disrupt, reverse-engineer, or overload the service</li>
          <li>No use that violates the policies of connected ad platforms</li>
          <li>Comply with applicable privacy laws and obtain necessary user consents</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Plans, billing & renewals">
        <p>
          Paid plans renew automatically at the end of each billing cycle. You can cancel any time
          from the dashboard; cancellation takes effect at the end of the current cycle. Usage above
          plan limits may incur overages or service throttling as described on the pricing page.
        </p>
      </LegalSection>

      <LegalSection title="5. Service availability">
        <p>
          We target 99.9% monthly availability for paid plans. Planned maintenance windows are
          announced in advance whenever possible.
        </p>
      </LegalSection>

      <LegalSection title="6. Intellectual property">
        <p>
          Tagify owns all rights to the platform, software, and brand. You retain ownership of your
          data and content. You grant us a limited license to process your data solely to provide
          the service.
        </p>
      </LegalSection>

      <LegalSection title="7. Disclaimers & liability">
        <p>
          The service is provided &quot;as is&quot; without warranties of any kind. To the maximum
          extent permitted by law, our aggregate liability is limited to the fees paid in the 12
          months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection title="8. Termination">
        <p>
          We may suspend or terminate accounts for breach of these terms, non-payment, or activity
          that risks the integrity of the platform.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law">
        <p>
          These terms are governed by the laws of the jurisdiction stated in your service order.
          Disputes will be resolved in the courts of that jurisdiction.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these terms? Email{" "}
          <span className="font-medium text-ink">legal@tagify.top</span>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
