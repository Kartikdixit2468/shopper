import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { upgradeToLocalStore } from "@/app/actions/presence";
import { MerchantShell } from "@/components/merchant-shell";
import { SubmitButton } from "@/components/submit-button";
import { requireMerchantStore } from "@/lib/merchant";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const { store } = await requireMerchantStore();
  if (store.type === "LOCAL_STORE") redirect("/dashboard");
  return (
    <MerchantShell
      active="overview"
      published={store.status === "PUBLISHED"}
      storeName={store.name}
      storeSlug={store.slug}
    >
      <div className="merchant-page upgrade-page">
        <Link className="back-link" href="/dashboard">
          <ArrowLeft size={16} /> Back to overview
        </Link>
        <section>
          <span className="upgrade-icon">
            <ShoppingBag size={28} />
          </span>
          <span className="section-kicker">Optional upgrade</span>
          <h1>Grow into a Local Store</h1>
          <p>
            Keep the same public URL, design, business information, gallery, and highlights. Local
            ordering tools will be added around your existing website.
          </p>
          <ul>
            <li>
              <Check size={17} /> Your current website stays published
            </li>
            <li>
              <Check size={17} /> No content or photos are removed
            </li>
            <li>
              <Check size={17} /> Products and unpaid local ordering arrive in Slice 3
            </li>
          </ul>
          <div className="inline-alert">
            Local Store ordering is not implemented yet. Upgrading now only changes your selected
            capability and preserves everything you have created.
          </div>
          <form action={upgradeToLocalStore}>
            <SubmitButton>Confirm Local Store upgrade</SubmitButton>
          </form>
        </section>
      </div>
    </MerchantShell>
  );
}
