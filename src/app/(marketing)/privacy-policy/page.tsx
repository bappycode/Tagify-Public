import type { Metadata } from "next";

import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Tagify collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="May 25, 2026"
      intro="Tagify respects your privacy. This policy explains what we collect, why, and the choices you have."
    >
      <LegalSection title="1. Information we collect">
        <p>
          We collect account information you provide (name, email, company), billing details
          processed by our payment providers, and operational data needed to deliver server-side
          tracking — such as container identifiers, server URLs, request volume, and diagnostic
          logs.
        </p>
        <p>
          We do not sell, rent, or share your end-users&apos; personal data with third parties for
          advertising.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use data">
        <ul className="list-disc space-y-2 pl-6">
          <li>To provision and operate your tracking containers and Gateway workspaces</li>
          <li>To bill and prevent fraud</li>
          <li>
            To send service notifications, security alerts, and product updates you opted into
          </li>
          <li>To improve reliability, performance, and product features</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Data processing & sub-processors">
        <p>
          Tagify acts as a data processor on your behalf when forwarding events to ad platforms
          (Meta, Google, TikTok, Snapchat). We rely on hosting and infrastructure sub-processors
          bound by data-processing agreements.
        </p>
      </LegalSection>

      <LegalSection title="4. Retention">
        <p>
          Operational logs are retained up to 30 days for debugging. Aggregated metrics may be kept
          longer for capacity planning. Account data is retained while your account is active and
          for a reasonable period afterwards to satisfy legal obligations.
        </p>
      </LegalSection>

      <LegalSection title="5. Your rights">
        <p>
          Depending on your jurisdiction, you may have rights to access, correct, export, or delete
          your personal data. Contact us at{" "}
          <span className="font-medium text-ink">privacy@tagify.top</span> to exercise these rights.
        </p>
      </LegalSection>

      <LegalSection title="6. Security">
        <p>
          We use industry-standard encryption in transit (TLS 1.2+), at-rest encryption for
          credentials, scoped API keys, and least-privilege access controls.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes to this policy">
        <p>
          We may update this policy as our service evolves. Significant changes will be announced
          via email or in-app notice at least 14 days before they take effect.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Questions about privacy? Reach us at{" "}
          <span className="font-medium text-ink">privacy@tagify.top</span>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
