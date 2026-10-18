"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Field, inputCls } from "@/components/auth/auth-shell";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token || searchParams.get("error")) {
    return (
      <p className="rounded-lg border border-ink/10 bg-cream p-4 text-sm">
        This reset link is invalid or has expired.{" "}
        <Link href="/forgot-password" className="font-medium text-coral hover:underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token: token! });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Reset failed");
      return;
    }
    toast.success("Password updated. Please sign in.");
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="New password">
        <input
          required
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
      </Field>
      <button
        disabled={loading}
        className="w-full rounded-full bg-coral px-5 py-3 text-sm font-medium text-white hover:bg-ink disabled:opacity-60"
      >
        {loading ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
