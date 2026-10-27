"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className="copy-link-button" onClick={copy} type="button">
      {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copied" : "Copy link"}
    </button>
  );
}
