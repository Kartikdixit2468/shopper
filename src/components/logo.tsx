import Link from "next/link";

import { siteConfig } from "@/lib/config";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link className="logo" href={href} aria-label={`${siteConfig.name} home`}>
      <span className="logo-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
