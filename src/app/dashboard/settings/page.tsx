"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { authClient, useSession, type SessionUser } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-ink/60">Profile and company details.</p>
      </div>

      {isPending || !session ? (
        <section className="h-64 animate-pulse rounded-xl border border-ink/10 bg-background" />
      ) : (
        <ProfileForm key={session.user.id} user={session.user} />
      )}
    </div>
  );
}

function ProfileForm({ user }: { user: SessionUser }) {
  const [name, setName] = useState(user.name ?? "");
  const [companyName, setCompanyName] = useState(user.companyName ?? "");
  const [website, setWebsite] = useState(user.website ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await authClient.updateUser({ name, companyName, website, phone });
    setSaving(false);
    if (error) toast.error(error.message ?? "Could not save profile");
    else toast.success("Profile saved");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-ink/10 bg-background p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={cls} />
        </Field>
        <Field label="Company">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={cls}
          />
        </Field>
        <Field label="Website">
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={cls}
            placeholder="https://"
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={cls}
          />
        </Field>
        <Field label="Email">
          <input value={user.email} disabled className={`${cls} opacity-60`} />
        </Field>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-ink disabled:opacity-50"
      >
        <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

const cls =
  "w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm outline-none focus:border-coral";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink/55">{label}</span>
      {children}
    </label>
  );
}
