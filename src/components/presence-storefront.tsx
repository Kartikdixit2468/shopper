import { Clock3, ExternalLink, Camera, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import type { PresenceSnapshot } from "@/lib/presence";

type StorefrontProps = { snapshot: PresenceSnapshot; preview?: boolean };

function mediaUrl(id: string | null) {
  return id ? `/media/${id}` : null;
}

export function PresenceStorefront({ snapshot, preview = false }: StorefrontProps) {
  const { store, contact, theme } = snapshot;
  const visibleSections = [...snapshot.sections]
    .filter((section) => section.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const logo = mediaUrl(theme.logoAssetId);
  const cover = mediaUrl(theme.coverAssetId);
  const phoneHref = contact.phone ? `tel:${contact.phone}` : null;
  const whatsappHref = contact.whatsappNumber
    ? `https://wa.me/${contact.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${store.name}, I found your website.`)}`
    : null;
  const style = {
    "--store-primary": theme.primaryColor,
    "--store-accent": theme.accentColor,
  } as CSSProperties;

  return (
    <div
      className={`presence-site template-${theme.templateId} font-${theme.fontSet}`}
      style={style}
    >
      {preview ? <div className="preview-ribbon">Draft preview — only you can see this</div> : null}
      <header className="presence-nav">
        <a className="presence-brand" href="#top">
          {logo ? (
            <Image alt={`${store.name} logo`} height={48} src={logo} unoptimized width={48} />
          ) : (
            <span>{store.name.charAt(0)}</span>
          )}
          <strong>{store.name}</strong>
        </a>
        <nav aria-label={`${store.name} sections`}>
          <a href="#about">About</a>
          <a href="#offerings">Highlights</a>
          <a href="#visit">Visit</a>
        </nav>
        {whatsappHref || phoneHref ? (
          <a className="presence-nav-cta" href={whatsappHref ?? phoneHref ?? "#contact"}>
            Contact us
          </a>
        ) : null}
      </header>

      {visibleSections.map((section) => {
        if (section.type === "HERO") {
          return (
            <section className={`presence-hero ${cover ? "has-cover" : ""}`} id="top" key="hero">
              {cover ? (
                <Image
                  alt={`${store.name} storefront`}
                  className="presence-cover"
                  fill
                  priority
                  sizes="100vw"
                  src={cover}
                  unoptimized
                />
              ) : (
                <div className="presence-cover-fallback" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              )}
              <div className="presence-hero-overlay" />
              <div className="presence-hero-copy">
                <span className="presence-category">{store.category}</span>
                <h1>{store.name}</h1>
                <p>
                  {store.shortDescription ||
                    `A local ${store.category.toLowerCase()} in ${contact.city}.`}
                </p>
                <div className="presence-hero-actions">
                  {whatsappHref ? (
                    <a
                      className="presence-primary-button"
                      href={whatsappHref}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <MessageCircle size={18} /> WhatsApp us
                    </a>
                  ) : null}
                  {contact.mapUrl ? (
                    <a
                      className="presence-secondary-button"
                      href={contact.mapUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <MapPin size={18} /> Get directions
                    </a>
                  ) : phoneHref ? (
                    <a className="presence-secondary-button" href={phoneHref}>
                      <Phone size={18} /> Call us
                    </a>
                  ) : null}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "ABOUT") {
          const heading =
            typeof section.content.heading === "string" ? section.content.heading : "About us";
          const body = typeof section.content.body === "string" ? section.content.body : "";
          if (!body && !store.shortDescription) return null;
          return (
            <section className="presence-section presence-about" id="about" key="about">
              <span className="presence-kicker">Our story</span>
              <h2>{heading}</h2>
              <p>{body || store.shortDescription}</p>
            </section>
          );
        }

        if (section.type === "GALLERY") {
          const ids = Array.isArray(section.content.assetIds)
            ? section.content.assetIds.filter((id): id is string => typeof id === "string")
            : [];
          if (!ids.length) return null;
          return (
            <section className="presence-section presence-gallery" key="gallery">
              <div className="presence-section-heading">
                <span className="presence-kicker">Inside our business</span>
                <h2>A closer look</h2>
              </div>
              <div className="presence-gallery-grid">
                {ids.map((id, index) => (
                  <Image
                    alt={`${store.name} photo ${index + 1}`}
                    height={520}
                    key={id}
                    src={`/media/${id}`}
                    unoptimized
                    width={720}
                  />
                ))}
              </div>
            </section>
          );
        }

        if (section.type === "LISTINGS") {
          const listings = snapshot.listings.filter((listing) => listing.visible);
          if (!listings.length) return null;
          return (
            <section className="presence-section presence-offerings" id="offerings" key="listings">
              <div className="presence-section-heading">
                <span className="presence-kicker">What you’ll find here</span>
                <h2>Our highlights</h2>
                <p>Browse a few things we offer, then contact us to know more.</p>
              </div>
              <div className="presence-listing-grid">
                {listings.map((listing) => (
                  <article key={listing.id}>
                    {listing.imageAssetId ? (
                      <Image
                        alt={listing.title}
                        height={380}
                        src={`/media/${listing.imageAssetId}`}
                        unoptimized
                        width={520}
                      />
                    ) : (
                      <div className="presence-listing-placeholder" aria-hidden="true">
                        {listing.title.charAt(0)}
                      </div>
                    )}
                    <div>
                      {listing.category ? <span>{listing.category}</span> : null}
                      <h3>{listing.title}</h3>
                      {listing.description ? <p>{listing.description}</p> : null}
                      <footer>
                        {listing.priceDisplay ? <strong>{listing.priceDisplay}</strong> : <span />}
                        <a href={whatsappHref ?? phoneHref ?? "#contact"}>Enquire</a>
                      </footer>
                    </div>
                  </article>
                ))}
              </div>
              <p className="presence-no-commerce">
                Items shown here are for enquiry only. Online ordering is not enabled.
              </p>
            </section>
          );
        }

        if (section.type === "HOURS" && contact.openingHours) {
          return (
            <section className="presence-info-band" id="visit" key="hours">
              <div>
                <Clock3 size={22} />
                <span>
                  <small>Opening hours</small>
                  <strong>{contact.openingHours.summary}</strong>
                </span>
              </div>
              <div>
                <MapPin size={22} />
                <span>
                  <small>Find us in</small>
                  <strong>
                    {contact.locality}, {contact.city}
                  </strong>
                </span>
              </div>
            </section>
          );
        }

        if (section.type === "LOCATION") {
          const address = [
            contact.addressLine,
            contact.locality,
            contact.city,
            contact.state,
            contact.postalCode,
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <section className="presence-section presence-location" key="location">
              <div>
                <span className="presence-kicker">Come say hello</span>
                <h2>Visit {store.name}</h2>
                <p>{address}</p>
              </div>
              {contact.mapUrl ? (
                <a href={contact.mapUrl} rel="noreferrer" target="_blank">
                  Open directions <ExternalLink size={17} />
                </a>
              ) : null}
            </section>
          );
        }

        if (section.type === "CONTACT") {
          return (
            <section className="presence-contact" id="contact" key="contact">
              <span className="presence-kicker">We’re here to help</span>
              <h2>Get in touch with {store.name}</h2>
              <div>
                {whatsappHref ? (
                  <a href={whatsappHref} rel="noreferrer" target="_blank">
                    <MessageCircle size={19} /> WhatsApp
                  </a>
                ) : null}
                {phoneHref ? (
                  <a href={phoneHref}>
                    <Phone size={19} /> Call {contact.phone}
                  </a>
                ) : null}
              </div>
            </section>
          );
        }

        if (section.type === "SOCIAL" && contact.socials) {
          return (
            <section className="presence-social" key="social">
              <span>Follow our updates</span>
              <div>
                {contact.socials.instagram ? (
                  <a
                    aria-label="Instagram"
                    href={contact.socials.instagram}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Camera />
                  </a>
                ) : null}
                {contact.socials.facebook ? (
                  <a
                    aria-label="Facebook"
                    href={contact.socials.facebook}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Send />
                  </a>
                ) : null}
              </div>
            </section>
          );
        }
        return null;
      })}

      <footer className="presence-footer">
        <strong>{store.name}</strong>
        <span>
          {contact.locality}, {contact.city}
        </span>
        <small>Information provided by this business.</small>
      </footer>
    </div>
  );
}
