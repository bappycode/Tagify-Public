"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { GithubLogo, GoogleLogo } from "@/components/logos";

type Provider = "google" | "github";

const PROVIDERS: { id: Provider; label: string; Logo: typeof GoogleLogo }[] = [
  { id: "google", label: "Google", Logo: GoogleLogo },
  { id: "github", label: "GitHub", Logo: GithubLogo },
];

export function SocialButtons({ callbackURL = "/dashboard" }: { callbackURL?: string }) {
  const [pending, setPending] = useState<Provider | null>(null);

  async function handleClick(provider: Provider) {
    setPending(provider);
    const { error } = await signIn.social({ provider, callbackURL });
    if (error) {
      toast.error(error.message ?? `Could not continue with ${provider}`);
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map(({ id, label, Logo }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleClick(id)}
            disabled={pending !== null}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-background px-4 py-2.5 text-sm font-medium transition hover:border-ink/40 disabled:opacity-60"
          >
            {pending === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Logo size={16} />}
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-ink/40">
        <span className="h-px flex-1 bg-ink/10" /> or with email{" "}
        <span className="h-px flex-1 bg-ink/10" />
      </div>
    </div>
  );
}
