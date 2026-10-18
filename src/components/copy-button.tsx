"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="font-mono text-[10px] uppercase tracking-widest text-background/55 hover:text-coral"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
