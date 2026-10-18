import type { Metadata } from "next";
import { FaqView } from "../_views/faq-view";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Tagify Gateway, sGTM hosting, billing and data.",
};

export default function FaqPage() {
  return <FaqView />;
}
