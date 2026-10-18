"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Field, inputCls } from "@/components/auth/auth-shell";
import { SocialButtons } from "@/components/auth/social-buttons";

function safeRedirect(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const redirectTo = safeRedirect(useSearchParams().get("redirect"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn.email({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Login failed");
      return;
    }
    toast.success("Welcome back");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SocialButtons callbackURL={redirectTo} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="••••••••"
          />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-ink/60 hover:text-coral">
            Forgot password?
          </Link>
        </div>
        <button
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-coral disabled:opacity-60"
        >
          {loading ? (
            "Signing in…"
          ) : (
            <>
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
        <p className="text-center text-sm text-ink/60">
          New to Tagify?{" "}
          <Link href="/signup" className="font-medium text-coral hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
