import type { Metadata } from "next";

import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Fair use policy",
  description: "How Tagify keeps shared infrastructure fast and reliable for everyone.",
};

export default function FairUsePage() {
  return (
    <LegalLayout
      title="Fair Use Policy"
      updated="May 25, 2026"
      intro="To keep Tagify fast and reliable for everyone, we apply a fair-use policy to high-volume usage."
    >
      <LegalSection title="1. Why fair use exists">
        <p>
          Server-side tracking can generate spiky, high-volume workloads. Fair use protects the
          platform from abuse and ensures consistent latency for every customer.
        </p>
      </LegalSection>

      <LegalSection title="2. What counts as fair use">
        <ul className="list-disc space-y-2 pl-6">
          <li>Request volumes within your plan&apos;s monthly allowance</li>
          <li>Reasonable burst rates aligned with normal e-commerce traffic patterns</li>
          <li>One container per distinct brand or storefront</li>
          <li>Standard tracking events (Page View, Add to Cart, Purchase, Lead, etc.)</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. What is not allowed">
        <ul className="list-disc space-y-2 pl-6">
          <li>Reselling capacity to third parties without an agency or partner agreement</li>
          <li>Sending synthetic, bot, or fabricated events to inflate metrics</li>
          <li>Using a single container to proxy traffic for unrelated brands</li>
          <li>Sustained burst rates that disrupt other tenants on shared infrastructure</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. What happens if you exceed fair use">
        <p>
          We will reach out to discuss the spike. Options include moving to a higher plan, enabling
          a dedicated instance, or temporarily throttling traffic to protect platform stability. We
          do not surprise-bill accounts for fair-use breaches.
        </p>
      </LegalSection>

      <LegalSection title="5. Need higher volume?">
        <p>
          Talk to us about Enterprise plans with dedicated capacity, isolated infrastructure, custom
          SLAs, and priority support. Email{" "}
          <span className="font-medium text-ink">sales@tagify.top</span>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
