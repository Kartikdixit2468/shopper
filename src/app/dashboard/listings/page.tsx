import { Eye, EyeOff, ImagePlus, Plus, Sparkles, Trash2, UploadCloud } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  createListing,
  deleteListing,
  publishPresence,
  toggleListing,
} from "@/app/actions/presence";
import { MerchantShell } from "@/components/merchant-shell";
import { SubmitButton } from "@/components/submit-button";
import { requireMerchantStore } from "@/lib/merchant";

export const metadata: Metadata = { title: "Business highlights" };
export const dynamic = "force-dynamic";

type ListingsPageProps = { searchParams: Promise<{ created?: string; error?: string }> };

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const { store } = await requireMerchantStore();
  const live = store.status === "PUBLISHED";

  return (
    <MerchantShell active="listings" published={live} storeName={store.name} storeSlug={store.slug}>
      <div className="merchant-page">
        {params.created ? (
          <div className="success-banner listing-saved-banner">
            <span>
              Highlight added to your draft.
              {live ? " Publish your changes when you’re ready to show it publicly." : ""}
            </span>
            {live ? (
              <form action={publishPresence}>
                <SubmitButton pendingText="Publishing…">
                  <UploadCloud size={16} /> Publish now
                </SubmitButton>
              </form>
            ) : null}
          </div>
        ) : null}
        {params.error ? <div className="inline-alert error-alert">{params.error}</div> : null}
        <header className="merchant-page-header">
          <div>
            <span className="dashboard-eyebrow">Listings</span>
            <h1>Show what you offer</h1>
            <p>
              These are informational highlights with an Enquire action—not products or online
              checkout.
            </p>
          </div>
          <div className="editor-header-actions">
            <Link href="/dashboard/preview" target="_blank">
              <Eye size={17} /> Preview draft
            </Link>
            {live ? (
              <form action={publishPresence}>
                <SubmitButton pendingText="Publishing…">
                  <UploadCloud size={17} /> Publish changes
                </SubmitButton>
              </form>
            ) : null}
          </div>
        </header>

        <div className="listings-layout">
          <section className="listing-form-card">
            <div className="editor-panel-title">
              <Plus size={19} />
              <span>
                <strong>Add a highlight</strong>
                <small>A service, speciality, or popular item</small>
              </span>
            </div>
            <form action={createListing}>
              <label>
                Name
                <input
                  maxLength={100}
                  name="title"
                  placeholder="e.g. Custom birthday cakes"
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  maxLength={500}
                  name="description"
                  placeholder="A short, useful description"
                  rows={4}
                />
              </label>
              <div className="field-grid">
                <label>
                  Category
                  <input name="category" placeholder="Cakes" />
                </label>
                <label>
                  Price display
                  <input name="priceDisplay" placeholder="From ₹750" />
                </label>
              </div>
              <label className="listing-upload">
                <ImagePlus size={18} /> Photo{" "}
                <input accept="image/jpeg,image/png,image/webp" name="image" type="file" />
              </label>
              <SubmitButton>
                <Plus size={17} /> Add highlight
              </SubmitButton>
            </form>
          </section>

          <section className="listing-collection">
            <div className="collection-heading">
              <div>
                <span className="dashboard-label">Your draft highlights</span>
                <h2>
                  {store.listings.length ? `${store.listings.length} added` : "Nothing added yet"}
                </h2>
              </div>
              {live ? (
                <small>Draft changes appear publicly only after you publish again.</small>
              ) : null}
            </div>
            {store.listings.length ? (
              <div className="merchant-listing-grid">
                {store.listings.map((listing) => (
                  <article className={!listing.visible ? "is-hidden" : ""} key={listing.id}>
                    {listing.imageAssetId ? (
                      <Image
                        alt={listing.title}
                        height={180}
                        src={`/media/${listing.imageAssetId}`}
                        unoptimized
                        width={280}
                      />
                    ) : (
                      <div className="listing-fallback">
                        <Sparkles size={24} />
                      </div>
                    )}
                    <div>
                      <span>{listing.category || "Highlight"}</span>
                      <h3>{listing.title}</h3>
                      {listing.description ? <p>{listing.description}</p> : null}
                      <footer>
                        {listing.priceDisplay ? <strong>{listing.priceDisplay}</strong> : <span />}
                      </footer>
                    </div>
                    <div className="listing-card-actions">
                      <form action={toggleListing}>
                        <input name="id" type="hidden" value={listing.id} />
                        <button type="submit">
                          {listing.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                          {listing.visible ? "Hide" : "Show"}
                        </button>
                      </form>
                      <form action={deleteListing}>
                        <input name="id" type="hidden" value={listing.id} />
                        <button className="danger-action" type="submit">
                          <Trash2 size={16} /> Remove
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="listings-empty">
                <Sparkles size={30} />
                <h3>Add your first business highlight</h3>
                <p>Help visitors quickly understand why they should contact you.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </MerchantShell>
  );
}
