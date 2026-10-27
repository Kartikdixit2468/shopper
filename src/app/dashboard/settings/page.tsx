import { MapPin, Save } from "lucide-react";
import type { Metadata } from "next";

import { autosaveContact, saveSettings } from "@/app/actions/presence";
import { AutosaveForm } from "@/components/autosave-form";
import { MerchantShell } from "@/components/merchant-shell";
import { SubmitButton } from "@/components/submit-button";
import { requireMerchantStore } from "@/lib/merchant";

export const metadata: Metadata = { title: "Business settings" };
export const dynamic = "force-dynamic";

function jsonText(value: unknown, key: string) {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>)[key] === "string"
    ? String((value as Record<string, unknown>)[key])
    : "";
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { store } = await requireMerchantStore();
  const contact = store.contact;
  const live = store.status === "PUBLISHED";

  return (
    <MerchantShell active="settings" published={live} storeName={store.name} storeSlug={store.slug}>
      <div className="merchant-page narrow-merchant-page">
        {params.saved ? (
          <div className="success-banner">Business settings saved to your draft.</div>
        ) : null}
        {params.error ? <div className="inline-alert error-alert">{params.error}</div> : null}
        <header className="merchant-page-header">
          <div>
            <span className="dashboard-eyebrow">Store settings</span>
            <h1>Contact and location</h1>
            <p>Keep this accurate so customers know when and how to reach you.</p>
          </div>
        </header>
        <AutosaveForm
          autosave={autosaveContact}
          className="settings-card setup-form"
          submitAction={saveSettings}
        >
          <div className="setup-form-heading">
            <span>
              <MapPin size={20} />
            </span>
            <div>
              <h2>Business details</h2>
              <p>Changes remain a draft until you publish your website again.</p>
            </div>
          </div>
          <div className="field-grid">
            <label>
              Locality
              <input defaultValue={contact?.locality ?? ""} name="locality" required />
            </label>
            <label>
              City
              <input defaultValue={contact?.city ?? ""} name="city" required />
            </label>
          </div>
          <label>
            Street address
            <input defaultValue={contact?.addressLine ?? ""} name="addressLine" />
          </label>
          <div className="field-grid">
            <label>
              State
              <input defaultValue={contact?.state ?? ""} name="state" />
            </label>
            <label>
              PIN code
              <input
                defaultValue={contact?.postalCode ?? ""}
                inputMode="numeric"
                maxLength={6}
                name="postalCode"
              />
            </label>
          </div>
          <div className="field-grid">
            <label>
              Phone
              <input defaultValue={contact?.phone ?? ""} inputMode="tel" name="phone" />
            </label>
            <label>
              WhatsApp
              <input
                defaultValue={contact?.whatsappNumber ?? ""}
                inputMode="tel"
                name="whatsappNumber"
              />
            </label>
          </div>
          <label>
            Opening hours
            <input defaultValue={jsonText(contact?.openingHours, "summary")} name="openingHours" />
          </label>
          <label>
            Directions URL
            <input defaultValue={contact?.mapUrl ?? ""} name="mapUrl" type="url" />
          </label>
          <div className="field-grid">
            <label>
              Instagram URL
              <input
                defaultValue={jsonText(contact?.socials, "instagram")}
                name="instagram"
                type="url"
              />
            </label>
            <label>
              Facebook URL
              <input
                defaultValue={jsonText(contact?.socials, "facebook")}
                name="facebook"
                type="url"
              />
            </label>
          </div>
          <div className="settings-save">
            <SubmitButton>
              <Save size={17} /> Save settings
            </SubmitButton>
          </div>
        </AutosaveForm>
      </div>
    </MerchantShell>
  );
}
