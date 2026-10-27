import {
  ArrowDown,
  ArrowUp,
  Eye,
  ImagePlus,
  LayoutTemplate,
  Palette,
  Rows3,
  UploadCloud,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  autosaveSection,
  moveSection,
  publishPresence,
  saveBranding,
  saveSection,
  uploadGalleryImage,
} from "@/app/actions/presence";
import { AutosaveForm } from "@/components/autosave-form";
import { MerchantShell } from "@/components/merchant-shell";
import { StorefrontPreviewFrame } from "@/components/storefront-preview-frame";
import { SubmitButton } from "@/components/submit-button";
import { ensurePresenceScaffold, requireMerchantStore } from "@/lib/merchant";
import { getPresenceChecklist, presenceInclude } from "@/lib/presence";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Edit website" };
export const dynamic = "force-dynamic";

type WebsitePageProps = { searchParams: Promise<{ saved?: string; error?: string }> };

const sectionLabels = {
  HERO: "Hero",
  ABOUT: "About",
  GALLERY: "Gallery",
  LISTINGS: "Highlights",
  HOURS: "Opening hours",
  LOCATION: "Location",
  CONTACT: "Contact",
  SOCIAL: "Social links",
} as const;

function contentText(value: unknown, key: string) {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>)[key] === "string"
    ? String((value as Record<string, unknown>)[key])
    : "";
}

export default async function WebsitePage({ searchParams }: WebsitePageProps) {
  const params = await searchParams;
  const { store: initialStore } = await requireMerchantStore();
  await ensurePresenceScaffold(initialStore.id);
  const store = await prisma.store.findUniqueOrThrow({
    where: { id: initialStore.id },
    include: presenceInclude,
  });
  const live = store.status === "PUBLISHED";
  const checklist = getPresenceChecklist(store);
  const gallery = store.sections.find((section) => section.type === "GALLERY");
  const galleryValue = gallery?.structuredContent as { assetIds?: unknown } | undefined;
  const galleryIds = Array.isArray(galleryValue?.assetIds)
    ? galleryValue.assetIds.filter((id): id is string => typeof id === "string")
    : [];

  return (
    <MerchantShell active="website" published={live} storeName={store.name} storeSlug={store.slug}>
      <div className="merchant-page editor-page">
        {params.saved ? <div className="success-banner">Your draft changes are saved.</div> : null}
        {params.error ? <div className="inline-alert error-alert">{params.error}</div> : null}
        <header className="merchant-page-header editor-header">
          <div>
            <span className="dashboard-eyebrow">Website editor</span>
            <h1>Shape your storefront</h1>
            <p>Draft changes stay private until you publish them.</p>
          </div>
          <div className="editor-header-actions">
            <Link href="/dashboard/preview" target="_blank">
              <Eye size={17} /> Preview
            </Link>
            {checklist.complete ? (
              <form action={publishPresence}>
                <SubmitButton>
                  <UploadCloud size={17} /> {live ? "Publish updates" : "Publish website"}
                </SubmitButton>
              </form>
            ) : (
              <Link className="merchant-primary-action" href="/onboarding/setup">
                Finish setup
              </Link>
            )}
          </div>
        </header>

        <div className="editor-layout">
          <div className="editor-controls">
            <details className="editor-panel" open>
              <summary>
                <Palette size={19} />
                <span>
                  <strong>Brand and style</strong>
                  <small>Template, colours and photos</small>
                </span>
              </summary>
              <form action={saveBranding} className="editor-panel-body">
                <label>
                  Template
                  <select defaultValue={store.theme?.templateId ?? "canvas"} name="templateId">
                    <option value="canvas">Canvas — clean</option>
                    <option value="heritage">Heritage — warm</option>
                    <option value="studio">Studio — bold</option>
                  </select>
                </label>
                <div className="field-grid color-grid">
                  <label>
                    Primary
                    <input
                      defaultValue={store.theme?.primaryColor ?? "#167D6D"}
                      name="primaryColor"
                      type="color"
                    />
                  </label>
                  <label>
                    Accent
                    <input
                      defaultValue={store.theme?.accentColor ?? "#F4AD82"}
                      name="accentColor"
                      type="color"
                    />
                  </label>
                </div>
                <label>
                  Typography
                  <select defaultValue={store.theme?.fontSet ?? "modern"} name="fontSet">
                    <option value="modern">Modern & clear</option>
                    <option value="friendly">Friendly & rounded</option>
                    <option value="editorial">Editorial & refined</option>
                  </select>
                </label>
                <div className="compact-upload">
                  <label>
                    <ImagePlus size={17} /> Replace logo
                    <input accept="image/jpeg,image/png,image/webp" name="logo" type="file" />
                  </label>
                  <label>
                    <ImagePlus size={17} /> Replace cover
                    <input accept="image/jpeg,image/png,image/webp" name="cover" type="file" />
                  </label>
                </div>
                <SubmitButton>Save design</SubmitButton>
              </form>
            </details>

            <div className="editor-panel section-manager">
              <div className="editor-panel-title">
                <Rows3 size={19} />
                <span>
                  <strong>Page sections</strong>
                  <small>Show, hide and reorder</small>
                </span>
              </div>
              <div className="section-list">
                {store.sections.map((section, index) => (
                  <AutosaveForm
                    autosave={autosaveSection}
                    className="section-editor-row"
                    key={section.id}
                    submitAction={saveSection}
                  >
                    <input name="type" type="hidden" value={section.type} />
                    <div className="section-row-top">
                      <label className="section-toggle">
                        <input defaultChecked={section.visible} name="visible" type="checkbox" />
                        <span />
                      </label>
                      <strong>{sectionLabels[section.type]}</strong>
                      <div className="section-order">
                        <button
                          aria-label={`Move ${sectionLabels[section.type]} up`}
                          disabled={index === 0}
                          formAction={moveSection}
                          name="direction"
                          type="submit"
                          value="up"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          aria-label={`Move ${sectionLabels[section.type]} down`}
                          disabled={index === store.sections.length - 1}
                          formAction={moveSection}
                          name="direction"
                          type="submit"
                          value="down"
                        >
                          <ArrowDown size={15} />
                        </button>
                      </div>
                    </div>
                    {section.type === "ABOUT" ? (
                      <div className="section-copy-fields">
                        <input
                          defaultValue={contentText(section.structuredContent, "heading")}
                          name="heading"
                          placeholder="About section heading"
                        />
                        <textarea
                          defaultValue={contentText(section.structuredContent, "body")}
                          maxLength={1200}
                          name="body"
                          placeholder="Tell customers what your business stands for."
                          rows={4}
                        />
                      </div>
                    ) : null}
                  </AutosaveForm>
                ))}
              </div>
            </div>

            <div className="editor-panel gallery-manager">
              <div className="editor-panel-title">
                <LayoutTemplate size={19} />
                <span>
                  <strong>Photo gallery</strong>
                  <small>Up to eight business photos</small>
                </span>
              </div>
              {galleryIds.length ? (
                <div className="gallery-thumbs">
                  {galleryIds.map((id) => (
                    <Image
                      alt="Gallery preview"
                      height={96}
                      key={id}
                      src={`/media/${id}`}
                      unoptimized
                      width={120}
                    />
                  ))}
                </div>
              ) : (
                <p className="editor-empty-copy">
                  Add authentic photos of your storefront, team, or work.
                </p>
              )}
              <form action={uploadGalleryImage} className="gallery-upload">
                <input accept="image/jpeg,image/png,image/webp" name="image" required type="file" />
                <input name="altText" placeholder="Describe this photo" />
                <SubmitButton>Add photo</SubmitButton>
              </form>
            </div>
          </div>

          <aside className="editor-preview-pane">
            <div className="editor-preview-toolbar">
              <span>
                <i /> Draft preview
              </span>
              <Link href="/dashboard/preview" target="_blank">
                Open full preview <Eye size={15} />
              </Link>
            </div>
            <StorefrontPreviewFrame />
          </aside>
        </div>
      </div>
    </MerchantShell>
  );
}
