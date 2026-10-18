import type { Metadata } from "next";
import { ContactView } from "../_views/contact-view";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to the Tagify team about sales, support, billing or partnerships.",
};

export default function ContactPage() {
  return <ContactView />;
}
