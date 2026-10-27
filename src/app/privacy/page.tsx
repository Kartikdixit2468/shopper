import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <main className="policy-page">
      <header className="policy-header shell">
        <Logo />
        <Link href="/">Back to home</Link>
      </header>
      <article className="policy-article">
        <span className="section-kicker">Beta notice</span>
        <h1>Privacy summary</h1>
        <p className="policy-intro">
          This development build stores the Google profile information needed for sign-in and the
          draft store choice linked to that account.
        </p>
        <h2>What is currently stored</h2>
        <p>
          Your name, email address, profile image, authenticated session, and selected store type.
        </p>
        <h2>What is not collected in Slice 1</h2>
        <p>
          No customer orders, payment details, delivery addresses, product data, or uploaded media.
        </p>
        <h2>Before a public launch</h2>
        <p>
          The operator must publish final retention, deletion, support, and legal-contact policies.
          This page is a transparent beta summary, not an invented final policy.
        </p>
      </article>
    </main>
  );
}
