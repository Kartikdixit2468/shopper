import { ArrowRight, Check, Globe2, LockKeyhole, ShoppingBag, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOutUser } from "@/app/actions/auth";
import { createDraftStore } from "@/app/actions/store";
import { Logo } from "@/components/logo";
import { SubmitButton } from "@/components/submit-button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Choose what to create" };
export const dynamic = "force-dynamic";

type TypePageProps = { searchParams: Promise<{ error?: string }> };

export default async function StoreTypePage({ searchParams }: TypePageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existingStore = await prisma.store.findUnique({
    where: { ownerUserId: user.id },
    select: { id: true },
  });
  if (existingStore) redirect("/dashboard");

  const params = await searchParams;

  return (
    <main className="onboarding-page">
      <header className="onboarding-header shell">
        <Logo />
        <div className="account-chip">
          <span className="account-avatar" aria-hidden="true">
            {(user.user_metadata.full_name || user.user_metadata.name || user.email || "A")
              .charAt(0)
              .toUpperCase()}
          </span>
          <span className="account-name">
            {user.user_metadata.full_name || user.user_metadata.name || user.email}
          </span>
          <form action={signOutUser}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <section className="choice-shell shell">
        <div className="choice-heading">
          <span className="choice-step">One quick question</span>
          <h1>What would you like to create?</h1>
          <p>Choose the simplest starting point for your business today.</p>
        </div>

        {params.error ? (
          <div className="inline-alert error-alert choice-error" role="alert">
            That store type is not available. Please choose Online Presence or Local Store.
          </div>
        ) : null}

        <div className="choice-grid">
          <article className="choice-card choice-presence">
            <div className="choice-art presence-art" aria-hidden="true">
              <div className="presence-window">
                <span className="window-top" />
                <div className="window-hero">
                  <span />
                  <i />
                  <i />
                </div>
                <div className="window-cards">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <span className="art-badge">
                <Globe2 size={14} /> Shareable page
              </span>
            </div>
            <div className="choice-card-copy">
              <div className="choice-title-row">
                <span className="choice-icon">
                  <Globe2 size={21} />
                </span>
                <span className="availability active">Available</span>
              </div>
              <h2>Online Presence</h2>
              <p>Put your business online and help customers find you.</p>
              <ul>
                <li>
                  <Check size={15} /> Business details, hours and location
                </li>
                <li>
                  <Check size={15} /> Gallery, highlights and contact links
                </li>
                <li>
                  <Check size={15} /> No cart or order taking
                </li>
              </ul>
              <form action={createDraftStore}>
                <input type="hidden" name="storeType" value="PRESENCE" />
                <SubmitButton className="choice-button">
                  Choose Online Presence <ArrowRight size={17} />
                </SubmitButton>
              </form>
            </div>
          </article>

          <article className="choice-card choice-local">
            <div className="choice-art local-art" aria-hidden="true">
              <div className="shop-awning">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="shop-front">
                <div className="shop-window">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="shop-door" />
              </div>
              <span className="art-badge">
                <ShoppingBag size={14} /> Local orders
              </span>
            </div>
            <div className="choice-card-copy">
              <div className="choice-title-row">
                <span className="choice-icon local-icon">
                  <ShoppingBag size={21} />
                </span>
                <span className="availability active">Available</span>
              </div>
              <h2>Local Store</h2>
              <p>Show products, accept local orders, and manage pickup or delivery.</p>
              <ul>
                <li>
                  <Check size={15} /> Everything in Online Presence
                </li>
                <li>
                  <Check size={15} /> Products, cart and local orders
                </li>
                <li>
                  <Check size={15} /> Payment arranged with your customer
                </li>
              </ul>
              <form action={createDraftStore}>
                <input type="hidden" name="storeType" value="LOCAL_STORE" />
                <SubmitButton className="choice-button">
                  Choose Local Store <ArrowRight size={17} />
                </SubmitButton>
              </form>
            </div>
          </article>

          <article className="choice-card choice-commerce">
            <div className="choice-art commerce-art" aria-hidden="true">
              <div className="commerce-box">
                <ShoppingCart size={38} />
              </div>
              <div className="commerce-lock">
                <LockKeyhole size={18} />
              </div>
            </div>
            <div className="choice-card-copy">
              <div className="choice-title-row">
                <span className="choice-icon commerce-icon">
                  <ShoppingCart size={21} />
                </span>
                <span className="availability soon">Coming soon</span>
              </div>
              <h2>Full E-commerce Store</h2>
              <p>Advanced online selling with broader commerce tools.</p>
              <ul>
                <li>
                  <Check size={15} /> Online payments
                </li>
                <li>
                  <Check size={15} /> National shipping integrations
                </li>
                <li>
                  <Check size={15} /> Advanced selling tools
                </li>
              </ul>
              <button className="choice-button disabled-choice" type="button" disabled>
                Coming soon
              </button>
            </div>
          </article>
        </div>
        <p className="choice-footnote">
          You can grow from Online Presence to Local Store later without losing your details.
        </p>
      </section>
    </main>
  );
}
