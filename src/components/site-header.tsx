"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { BrandMark } from "@/components/brand-mark";
import { CurrentYear } from "@/components/current-year";

const navLinks: [string, string][] = [
  ["Features", "/features"],
  ["How it works", "/how-it-works"],
  ["Pricing", "/pricing"],
  ["Instructions", "/instructions"],
  ["Blog", "/blog"],
  ["FAQ", "/faq"],
];

export function SiteHeader() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-background md:bg-background/80 md:backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid h-8 w-8 place-items-center rounded-md bg-ink text-background">
              <BrandMark className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">tagify</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-ink/70 md:flex">
            {navLinks.map(([l, h]) => (
              <Link key={h} href={h} className="transition hover:text-ink">
                {l}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="group hidden md:inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background transition hover:bg-coral"
              >
                Dashboard <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:rotate-45" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:inline-flex text-sm text-ink/70 transition hover:text-ink"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="group hidden md:inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background transition hover:bg-coral"
                >
                  Try free <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:rotate-45" />
                </Link>
              </>
            )}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ink/15 text-ink md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-x-0 top-16 z-50 border-b border-ink/10 bg-background shadow-lg shadow-ink/5">
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3 text-base">
            {navLinks.map(([l, h]) => (
              <Link
                key={h}
                href={h}
                onClick={() => setOpen(false)}
                className="border-b border-ink/5 py-3 text-ink/80 transition hover:text-ink"
              >
                {l}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2.5 pb-1">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background"
                >
                  Dashboard <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-ink/15 px-5 py-2.5 text-center text-sm font-medium text-ink"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background"
                  >
                    Try free <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-cream">
      <div className="mx-auto grid grid-cols-2 gap-8 px-5 py-10 sm:gap-10 md:grid-cols-5 md:py-14 max-w-7xl">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-ink text-background">
              <BrandMark className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">tagify</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-ink/60">
            Server-side tracking, sGTM hosting and Tagify Gateway — built for serious advertisers.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ["Features", "/features"],
            ["Pricing", "/pricing"],
            ["How it works", "/how-it-works"],
            ["Instructions", "/instructions"],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ["About", "/about"],
            ["Contact", "/contact"],
            ["Affiliate", "/affiliate-program"],
            ["FAQ", "/faq"],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ["Privacy", "/privacy-policy"],
            ["Terms", "/terms-of-service"],
            ["Fair use", "/fair-use"],
          ]}
        />
      </div>
      <div className="border-t border-ink/10 px-5 py-5 text-center text-xs text-ink/50">
        © <CurrentYear /> Tagify. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-ink/45">{title}</p>
      <ul className="space-y-2 text-sm text-ink/70">
        {links.map(([l, h]) => (
          <li key={h}>
            <Link href={h} className="transition hover:text-ink">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
