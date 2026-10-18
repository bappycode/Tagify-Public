import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password" subtitle="We'll email you a secure reset link.">
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-ink/60">
        <Link href="/login" className="hover:text-coral">
          ← Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
