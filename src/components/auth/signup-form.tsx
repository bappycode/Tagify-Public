"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { Field, inputCls } from "@/components/auth/auth-shell";
import { SocialButtons } from "@/components/auth/social-buttons";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp.email({
      name: fullName,
      email,
      password,
      companyName: company || undefined,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Signup failed");
      return;
    }
    toast.success("Welcome to Tagify");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SocialButtons />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name">
          <input
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls}
            placeholder="Khairul Islam"
          />
        </Field>
        <Field label="Company">
          <input
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputCls}
            placeholder="Acme Co."
          />
        </Field>
        <Field label="Work email">
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@company.com"
          />
        </Field>
        <Field label="Password">
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="At least 8 characters"
          />
        </Field>
        <button
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-coral px-5 py-3 text-sm font-medium text-white transition hover:bg-ink disabled:opacity-60"
        >
          {loading ? (
            "Creating account…"
          ) : (
            <>
              Create account <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
        <p className="text-center text-sm text-ink/60">
          Already have one?{" "}
          <Link href="/login" className="font-medium text-coral hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
