import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <AuthShell title="Start with Tagify" subtitle="15,000 events/mo free. No card required.">
      <SignupForm />
    </AuthShell>
  );
}
