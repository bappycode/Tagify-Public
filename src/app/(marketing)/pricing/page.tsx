import type { Metadata } from "next";
import { PricingView } from "../_views/pricing-view";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, usage-based pricing for Tagify Gateway and sGTM hosting. Start free.",
};

export default function PricingPage() {
  return <PricingView />;
}
