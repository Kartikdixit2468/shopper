import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Beta terms" };

export default function TermsPage() {
  return (
    <main className="policy-page">
      <header className="policy-header shell">
        <Logo />
        <Link href="/">Back to home</Link>
      </header>
      <article className="policy-article">
        <span className="section-kicker">Beta notice</span>
        <h1>Development terms summary</h1>
        <p className="policy-intro">
          This is a development-stage product. Final commercial terms, pricing, support commitments,
          and merchant policies have not been decided.
        </p>
        <h2>Current product boundary</h2>
        <p>
          Slice 1 supports Google sign-in and creation of a saved draft store type. It does not yet
          publish a storefront, take orders, process payments, or provide delivery.
        </p>
        <h2>Merchant responsibility</h2>
        <p>
          Future Local Store fulfilment is planned to be managed by the merchant. The platform will
          not represent itself as a courier or payment provider.
        </p>
        <h2>Before a public launch</h2>
        <p>The operator must replace this summary with reviewed, business-specific terms.</p>
      </article>
    </main>
  );
}
