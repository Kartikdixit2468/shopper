import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Pencil,
  QrCode,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { MerchantShell } from "@/components/merchant-shell";
import { CopyLinkButton } from "@/components/share-actions";
import { requireMerchantStore } from "@/lib/merchant";
import { getPresenceChecklist } from "@/lib/presence";

export const metadata: Metadata = { title: "Your business" };
export const dynamic = "force-dynamic";

type DashboardProps = {
  searchParams: Promise<{ published?: string; upgraded?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const params = await searchParams;
  const { store } = await requireMerchantStore();
  const checklist = getPresenceChecklist(store);
  const completed = checklist.checks.filter((item) => item.complete).length;
  const live = store.status === "PUBLISHED" && Boolean(store.slug);

  return (
    <MerchantShell active="overview" published={live} storeName={store.name} storeSlug={store.slug}>
      <div className="merchant-page">
        {params.published ? (
          <div className="success-banner">
            <CheckCircle2 size={20} /> Your website is live. You can share it now.
          </div>
        ) : null}
        {params.upgraded ? (
          <div className="success-banner">
            <CheckCircle2 size={20} /> Local Store mode is enabled. Ordering tools arrive in Slice
            3.
          </div>
        ) : null}
        <header className="merchant-page-header">
          <div>
            <span className="dashboard-eyebrow">Business overview</span>
            <h1>
              {store.name ? `Welcome back to ${store.name}` : "Let’s finish your business page"}
            </h1>
            <p>
              {live
                ? "Your public website is online. New changes stay in draft until you publish again."
                : "Complete your details, preview your page, and publish when it feels right."}
            </p>
          </div>
          <Link
            className="merchant-primary-action"
            href={store.onboardingStep === "COMPLETE" ? "/dashboard/website" : "/onboarding/setup"}
          >
            {store.onboardingStep === "COMPLETE" ? "Edit website" : "Continue setup"}{" "}
            <ArrowRight size={17} />
          </Link>
        </header>

        <div className="overview-status-grid">
          <section className="website-status-card">
            <div className="status-card-top">
              <span className={live ? "is-live" : "is-draft"}>
                <Globe2 size={18} />
              </span>
              <small>{live ? "Published website" : "Private draft"}</small>
            </div>
            <h2>{live ? "Your business is online" : "Your page is taking shape"}</h2>
            <p>
              {live
                ? `Customers can visit /s/${store.slug}`
                : `${completed} of ${checklist.checks.length} publishing essentials complete.`}
            </p>
            <div className="completion-track">
              <span style={{ width: `${(completed / checklist.checks.length) * 100}%` }} />
            </div>
            <div className="status-card-actions">
              <Link href="/dashboard/preview" target="_blank">
                <Sparkles size={17} /> Preview draft
              </Link>
              {live ? (
                <Link href={`/s/${store.slug}`} target="_blank">
                  View live <ExternalLink size={16} />
                </Link>
              ) : null}
            </div>
          </section>

          <section className="quick-actions-card">
            <span className="dashboard-label">Quick actions</span>
            <Link href="/dashboard/website">
              <Pencil size={18} />
              <span>
                <strong>Edit website</strong>
                <small>Design, content and sections</small>
              </span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard/listings">
              <Sparkles size={18} />
              <span>
                <strong>Manage highlights</strong>
                <small>Show what your business offers</small>
              </span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard/settings">
              <Globe2 size={18} />
              <span>
                <strong>Business settings</strong>
                <small>Hours, contact and location</small>
              </span>
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>

        {live && store.slug ? (
          <section className="share-store-card">
            <div>
              <span className="share-icon">
                <QrCode size={23} />
              </span>
              <div>
                <span className="dashboard-label">Share your website</span>
                <h2>One link for your whole business</h2>
                <p>Put it in WhatsApp, Instagram, or print the QR for your counter.</p>
              </div>
            </div>
            <div className="share-url">
              <span>/s/{store.slug}</span>
              <CopyLinkButton path={`/s/${store.slug}`} />
              <Link href={`/s/${store.slug}/qr`} target="_blank">
                Download QR
              </Link>
            </div>
          </section>
        ) : null}

        {store.type === "PRESENCE" && store.onboardingStep === "COMPLETE" ? (
          <section className="upgrade-strip">
            <div>
              <span>Ready to accept local orders later?</span>
              <p>Your website, URL, and content will carry over when you enable Local Store.</p>
            </div>
            <Link href="/dashboard/upgrade">
              See Local Store upgrade <ArrowRight size={17} />
            </Link>
          </section>
        ) : null}
      </div>
    </MerchantShell>
  );
}
