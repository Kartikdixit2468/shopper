import { ArrowLeft, ArrowRight, Check, Eye, ImagePlus, MapPin, Palette, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  autosaveBasics,
  autosaveContact,
  continueFromBasics,
  continueFromContact,
  publishPresence,
  saveDesign,
} from "@/app/actions/presence";
import { AutosaveForm } from "@/components/autosave-form";
import { Logo } from "@/components/logo";
import { PresenceStorefront } from "@/components/presence-storefront";
import { SubmitButton } from "@/components/submit-button";
import { ensurePresenceScaffold, requireMerchantStore } from "@/lib/merchant";
import {
  buildPresenceSnapshot,
  getPresenceChecklist,
  presenceInclude,
  type PresenceStore,
} from "@/lib/presence";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Set up your business" };
export const dynamic = "force-dynamic";

type SetupPageProps = {
  searchParams: Promise<{ step?: string; error?: string; created?: string }>;
};

const steps = [
  { id: "basics", label: "Business basics" },
  { id: "contact", label: "Contact & location" },
  { id: "design", label: "Make it yours" },
  { id: "review", label: "Review & publish" },
] as const;

function jsonText(value: unknown, key: string) {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>)[key] === "string"
    ? String((value as Record<string, unknown>)[key])
    : "";
}

function SetupProgress({ current }: { current: string }) {
  const currentIndex = steps.findIndex((step) => step.id === current);
  return (
    <ol className="setup-progress">
      {steps.map((step, index) => (
        <li className={index <= currentIndex ? "active" : ""} key={step.id}>
          <span>{index < currentIndex ? <Check size={14} /> : index + 1}</span>
          <small>{step.label}</small>
        </li>
      ))}
    </ol>
  );
}

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const params = await searchParams;
  const { store: initialStore } = await requireMerchantStore();
  if (initialStore.onboardingStep === "COMPLETE" && !params.step) redirect("/dashboard");

  const fallback =
    initialStore.onboardingStep === "CONTACT"
      ? "contact"
      : initialStore.onboardingStep === "BRANDING"
        ? "design"
        : initialStore.onboardingStep === "REVIEW"
          ? "review"
          : "basics";
  const step = steps.some((item) => item.id === params.step) ? params.step! : fallback;

  if (step === "review" && (!initialStore.theme || initialStore.sections.length === 0)) {
    await ensurePresenceScaffold(initialStore.id);
  }
  const store = (
    step === "review"
      ? await prisma.store.findUniqueOrThrow({
          where: { id: initialStore.id },
          include: presenceInclude,
        })
      : initialStore
  ) as PresenceStore;

  const openingHours = jsonText(store.contact?.openingHours, "summary");
  const instagram = jsonText(store.contact?.socials, "instagram");
  const facebook = jsonText(store.contact?.socials, "facebook");

  return (
    <main className="setup-page">
      <header className="setup-topbar shell">
        <Logo />
        <span>Your draft is private until you publish</span>
      </header>
      <div className="setup-layout shell">
        <aside className="setup-aside">
          <span className="section-kicker">Create your presence</span>
          <h1>Let’s bring your business online.</h1>
          <p>Four short steps. You can leave and come back anytime.</p>
          <SetupProgress current={step} />
        </aside>

        <section className="setup-card">
          {params.error ? <div className="inline-alert error-alert">{params.error}</div> : null}
          {params.created ? (
            <div className="inline-alert">Your starting point is saved. Now make it yours.</div>
          ) : null}

          {step === "basics" ? (
            <AutosaveForm
              autosave={autosaveBasics}
              className="setup-form"
              submitAction={continueFromBasics}
            >
              <div className="setup-form-heading">
                <span>
                  <Store size={20} />
                </span>
                <div>
                  <small>Step 1 of 4</small>
                  <h2>Tell us about your business</h2>
                  <p>This becomes the headline of your public page.</p>
                </div>
              </div>
              <label>
                Business name{" "}
                <input
                  defaultValue={store.name ?? ""}
                  name="name"
                  placeholder="e.g. Rao’s Fresh Mart"
                  required
                />
              </label>
              <label>
                Business category
                <select defaultValue={store.category ?? ""} name="category" required>
                  <option disabled value="">
                    Choose a category
                  </option>
                  <option>Grocery & essentials</option>
                  <option>Beauty & wellness</option>
                  <option>Clothing & boutique</option>
                  <option>Food & bakery</option>
                  <option>Electronics</option>
                  <option>Stationery</option>
                  <option>Professional services</option>
                  <option>Home & lifestyle</option>
                  <option>Other local business</option>
                </select>
              </label>
              <label>
                Short description{" "}
                <textarea
                  defaultValue={store.shortDescription ?? ""}
                  maxLength={300}
                  name="shortDescription"
                  placeholder="What makes your business useful or special?"
                  rows={4}
                />
                <small>Optional · up to 300 characters</small>
              </label>
              <label>
                Your public link{" "}
                <div className="slug-input">
                  <span>/s/</span>
                  <input
                    defaultValue={store.slug ?? ""}
                    name="slug"
                    placeholder="raos-fresh-mart"
                  />
                </div>
                <small>We’ll safely adjust it if another business already uses it.</small>
              </label>
              <div className="setup-actions">
                <span />
                <SubmitButton>
                  Save and continue <ArrowRight size={17} />
                </SubmitButton>
              </div>
            </AutosaveForm>
          ) : null}

          {step === "contact" ? (
            <AutosaveForm
              autosave={autosaveContact}
              className="setup-form"
              submitAction={continueFromContact}
            >
              <div className="setup-form-heading">
                <span>
                  <MapPin size={20} />
                </span>
                <div>
                  <small>Step 2 of 4</small>
                  <h2>Help customers find you</h2>
                  <p>Add at least one contact method. Exact address is optional.</p>
                </div>
              </div>
              <div className="field-grid">
                <label>
                  Locality{" "}
                  <input
                    defaultValue={store.contact?.locality ?? ""}
                    name="locality"
                    placeholder="Indiranagar"
                    required
                  />
                </label>
                <label>
                  City{" "}
                  <input
                    defaultValue={store.contact?.city ?? ""}
                    name="city"
                    placeholder="Bengaluru"
                    required
                  />
                </label>
              </div>
              <label>
                Street address{" "}
                <input
                  defaultValue={store.contact?.addressLine ?? ""}
                  name="addressLine"
                  placeholder="Shop 4, 12th Main Road"
                />
              </label>
              <div className="field-grid">
                <label>
                  State{" "}
                  <input
                    defaultValue={store.contact?.state ?? ""}
                    name="state"
                    placeholder="Karnataka"
                  />
                </label>
                <label>
                  PIN code{" "}
                  <input
                    defaultValue={store.contact?.postalCode ?? ""}
                    inputMode="numeric"
                    maxLength={6}
                    name="postalCode"
                    placeholder="560038"
                  />
                </label>
              </div>
              <div className="field-grid">
                <label>
                  Phone{" "}
                  <input
                    defaultValue={store.contact?.phone ?? ""}
                    inputMode="tel"
                    name="phone"
                    placeholder="98765 43210"
                  />
                </label>
                <label>
                  WhatsApp{" "}
                  <input
                    defaultValue={store.contact?.whatsappNumber ?? ""}
                    inputMode="tel"
                    name="whatsappNumber"
                    placeholder="98765 43210"
                  />
                </label>
              </div>
              <label>
                Opening hours{" "}
                <input
                  defaultValue={openingHours}
                  name="openingHours"
                  placeholder="Mon–Sat, 9:00 am–8:00 pm"
                />
              </label>
              <label>
                Google Maps or directions link{" "}
                <input
                  defaultValue={store.contact?.mapUrl ?? ""}
                  name="mapUrl"
                  placeholder="https://maps.google.com/..."
                  type="url"
                />
              </label>
              <details className="optional-fields">
                <summary>Social links (optional)</summary>
                <label>
                  Instagram URL{" "}
                  <input
                    defaultValue={instagram}
                    name="instagram"
                    placeholder="https://instagram.com/..."
                    type="url"
                  />
                </label>
                <label>
                  Facebook URL{" "}
                  <input
                    defaultValue={facebook}
                    name="facebook"
                    placeholder="https://facebook.com/..."
                    type="url"
                  />
                </label>
              </details>
              <div className="setup-actions">
                <Link href="/onboarding/setup?step=basics">
                  <ArrowLeft size={17} /> Back
                </Link>
                <SubmitButton>
                  Save and continue <ArrowRight size={17} />
                </SubmitButton>
              </div>
            </AutosaveForm>
          ) : null}

          {step === "design" ? (
            <form action={saveDesign} className="setup-form">
              <div className="setup-form-heading">
                <span>
                  <Palette size={20} />
                </span>
                <div>
                  <small>Step 3 of 4</small>
                  <h2>Choose your storefront style</h2>
                  <p>Start with a polished template and make it feel like you.</p>
                </div>
              </div>
              <div className="template-picker">
                {[
                  { id: "canvas", name: "Canvas", note: "Clean and welcoming" },
                  { id: "heritage", name: "Heritage", note: "Warm and established" },
                  { id: "studio", name: "Studio", note: "Bold and visual" },
                ].map((template) => (
                  <label key={template.id}>
                    <input
                      defaultChecked={(store.theme?.templateId ?? "canvas") === template.id}
                      name="templateId"
                      type="radio"
                      value={template.id}
                    />
                    <span className={`template-swatch ${template.id}`}>
                      <i />
                      <i />
                      <i />
                    </span>
                    <strong>{template.name}</strong>
                    <small>{template.note}</small>
                  </label>
                ))}
              </div>
              <div className="field-grid color-grid">
                <label>
                  Primary colour{" "}
                  <input
                    defaultValue={store.theme?.primaryColor ?? "#167D6D"}
                    name="primaryColor"
                    type="color"
                  />
                </label>
                <label>
                  Accent colour{" "}
                  <input
                    defaultValue={store.theme?.accentColor ?? "#F4AD82"}
                    name="accentColor"
                    type="color"
                  />
                </label>
              </div>
              <label>
                Typography{" "}
                <select defaultValue={store.theme?.fontSet ?? "modern"} name="fontSet">
                  <option value="modern">Modern & clear</option>
                  <option value="friendly">Friendly & rounded</option>
                  <option value="editorial">Editorial & refined</option>
                </select>
              </label>
              <div className="upload-grid">
                <label>
                  <ImagePlus size={21} />
                  <strong>Business logo</strong>
                  <span>Square JPG, PNG or WebP · max 5 MB</span>
                  <input accept="image/jpeg,image/png,image/webp" name="logo" type="file" />
                </label>
                <label>
                  <ImagePlus size={21} />
                  <strong>Cover photo</strong>
                  <span>Wide storefront or product photo · max 5 MB</span>
                  <input accept="image/jpeg,image/png,image/webp" name="cover" type="file" />
                </label>
              </div>
              <div className="setup-actions">
                <Link href="/onboarding/setup?step=contact">
                  <ArrowLeft size={17} /> Back
                </Link>
                <SubmitButton pendingText="Saving design…">
                  Save and review <ArrowRight size={17} />
                </SubmitButton>
              </div>
            </form>
          ) : null}

          {step === "review" ? <ReviewStep store={store} /> : null}
        </section>
      </div>
    </main>
  );
}

function ReviewStep({ store }: { store: PresenceStore }) {
  const checklist = getPresenceChecklist(store);
  const snapshot = checklist.complete ? buildPresenceSnapshot(store) : null;
  return (
    <div className="setup-form review-step">
      <div className="setup-form-heading">
        <span>
          <Eye size={20} />
        </span>
        <div>
          <small>Step 4 of 4</small>
          <h2>Ready for your first look?</h2>
          <p>Review the essentials, preview your site, then publish when it feels right.</p>
        </div>
      </div>
      <div className="review-checklist">
        {checklist.checks.map((item) => (
          <div className={item.complete ? "complete" : ""} key={item.label}>
            <span>{item.complete ? <Check size={15} /> : "!"}</span>
            {item.label}
          </div>
        ))}
      </div>
      {snapshot ? (
        <div className="setup-preview">
          <PresenceStorefront preview snapshot={snapshot} />
        </div>
      ) : (
        <div className="empty-review">Complete the missing items before previewing.</div>
      )}
      <div className="setup-actions">
        <Link href="/onboarding/setup?step=design">
          <ArrowLeft size={17} /> Back
        </Link>
        {checklist.complete ? (
          <form action={publishPresence}>
            <SubmitButton>
              Publish my website <ArrowRight size={17} />
            </SubmitButton>
          </form>
        ) : (
          <Link className="button-link" href="/onboarding/setup?step=basics">
            Complete setup
          </Link>
        )}
      </div>
    </div>
  );
}
