import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Globe2,
  LayoutTemplate,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";

const modeCards = [
  {
    icon: Globe2,
    kicker: "Be discoverable",
    title: "Online Presence",
    description:
      "A polished home for your business details, work, hours, location and contact links.",
    detail: "No cart or checkout — just a clear, shareable business site.",
    className: "mode-card presence-card",
    active: true,
  },
  {
    icon: ShoppingBag,
    kicker: "Sell nearby",
    title: "Local Store",
    description: "Show products and take local orders for pickup or delivery managed by your shop.",
    detail: "Orders are paid directly to you. No platform delivery promises.",
    className: "mode-card local-card",
    active: true,
  },
  {
    icon: PackageCheck,
    kicker: "Coming soon",
    title: "Full E-commerce",
    description: "Advanced online selling, national shipping, payments and a wider toolkit.",
    detail: "We’re keeping this honest: it is not available yet.",
    className: "mode-card commerce-card",
    active: false,
  },
];

const steps = [
  {
    number: "01",
    title: "Sign in and choose",
    copy: "Use your Google account, then answer one simple question about what you need today.",
  },
  {
    number: "02",
    title: "Make it yours",
    copy: "Add your business details and pick a look that feels like your shop—not a generic directory listing.",
  },
  {
    number: "03",
    title: "Share one clear link",
    copy: "Give customers one reliable place to find your hours, location, products and ways to contact you.",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <div className="shell header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#modes">What you can build</a>
            <a href="#how-it-works">How it works</a>
            <a href="#questions">Questions</a>
          </nav>
          <div className="header-actions">
            <Link className="text-link desktop-only" href="/login">
              Sign in
            </Link>
            <Link className="button button-small" href="/login">
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-wash" aria-hidden="true" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> Made for independent Indian businesses
            </div>
            <h1>Your shop deserves a beautiful place online.</h1>
            <p className="hero-lede">
              Create a professional business page or a simple local store—without wrestling with
              technology you do not need.
            </p>
            <div className="hero-actions">
              <Link className="button button-large" href="/login">
                Create your store <ArrowRight size={18} />
              </Link>
              <a className="quiet-button" href="#preview">
                See how it could look
              </a>
            </div>
            <div className="hero-proof" aria-label="Product benefits">
              <span>
                <BadgeCheck size={17} /> Start with Google
              </span>
              <span>
                <BadgeCheck size={17} /> Keep your progress
              </span>
              <span>
                <BadgeCheck size={17} /> Built for mobile
              </span>
            </div>
          </div>

          <div className="hero-visual" id="preview" aria-label="Example online business preview">
            <div className="visual-orbit orbit-one" aria-hidden="true" />
            <div className="visual-orbit orbit-two" aria-hidden="true" />
            <div className="browser-frame">
              <div className="browser-bar">
                <div className="browser-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="browser-address">yourstore.in/s/your-shop</div>
              </div>
              <div className="sample-shop">
                <div className="sample-cover">
                  <div className="sample-nav">
                    <div className="sample-brand">
                      <span>DM</span>
                      <div>
                        <strong>Demo Market</strong>
                        <small>Everyday essentials</small>
                      </div>
                    </div>
                    <div className="sample-menu">About&nbsp;&nbsp; Products&nbsp;&nbsp; Visit</div>
                  </div>
                  <div className="sample-hero-copy">
                    <span className="demo-label">DEMO STOREFRONT</span>
                    <h2>Your neighbourhood favourites, one tap away.</h2>
                    <p>Browse what is available, then order directly from the shop.</p>
                    <span className="sample-cta">Browse products</span>
                  </div>
                  <div className="sample-basket" aria-hidden="true">
                    <span className="basket-handle" />
                    <span className="basket-item item-one" />
                    <span className="basket-item item-two" />
                    <span className="basket-item item-three" />
                  </div>
                </div>
                <div className="sample-meta">
                  <span>
                    <MapPin size={14} /> Your locality
                  </span>
                  <span>
                    <Clock3 size={14} /> Open today
                  </span>
                  <span>
                    <MessageCircle size={14} /> WhatsApp
                  </span>
                </div>
              </div>
            </div>
            <div className="floating-note note-top">
              <span className="note-icon">
                <Sparkles size={16} />
              </span>
              <div>
                <strong>Looks like your business</strong>
                <small>Colours, details and sections you choose</small>
              </div>
            </div>
            <div className="floating-note note-bottom">
              <span className="online-dot" />
              <div>
                <strong>Easy to share</strong>
                <small>One link for every customer</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="promise-strip" aria-label="Designed for local business">
        <div className="shell promise-inner">
          <p>Designed around the way local business actually works</p>
          <div>
            <span>Kirana & grocery</span>
            <span>Salons & services</span>
            <span>Boutiques</span>
            <span>Stationery</span>
            <span>Speciality stores</span>
          </div>
        </div>
      </section>

      <section className="section shell" id="modes">
        <div className="section-heading heading-split">
          <div>
            <span className="section-kicker">Begin where you are</span>
            <h2>Choose only what your business needs.</h2>
          </div>
          <p>
            Start with a professional presence or add local ordering. The foundation is shared, so
            your business can grow without starting over.
          </p>
        </div>
        <div className="mode-grid">
          {modeCards.map((mode) => {
            const Icon = mode.icon;
            return (
              <article className={mode.className} key={mode.title}>
                <div className="mode-card-top">
                  <span className="mode-icon">
                    <Icon size={23} />
                  </span>
                  <span className={mode.active ? "availability active" : "availability soon"}>
                    {mode.active ? "Available" : "Coming soon"}
                  </span>
                </div>
                <span className="mode-kicker">{mode.kicker}</span>
                <h3>{mode.title}</h3>
                <p>{mode.description}</p>
                <div className="mode-detail">{mode.detail}</div>
                {mode.active ? (
                  <Link className="mode-link" href="/login">
                    Choose after sign-in <ArrowRight size={16} />
                  </Link>
                ) : (
                  <span className="mode-link disabled" aria-disabled="true">
                    Not available yet
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="section soft-section" id="how-it-works">
        <div className="shell">
          <div className="section-heading centered-heading">
            <span className="section-kicker">Simple from the first tap</span>
            <h2>From “I should be online” to a place you are proud to share.</h2>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <div className="step-illustration" aria-hidden="true">
                  {index === 0 ? (
                    <div className="mini-choice">
                      <span className="selected" />
                      <span />
                      <span />
                    </div>
                  ) : null}
                  {index === 1 ? (
                    <div className="mini-theme">
                      <span />
                      <i />
                      <i />
                      <i />
                    </div>
                  ) : null}
                  {index === 2 ? (
                    <div className="mini-share">
                      <span>your link</span>
                      <ArrowRight size={17} />
                    </div>
                  ) : null}
                </div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell detail-grid">
        <div className="detail-visual" aria-label="Mobile-first editing illustration">
          <div className="edit-panel">
            <div className="edit-panel-head">
              <LayoutTemplate size={18} /> Your website
              <span>Saved</span>
            </div>
            <div className="edit-row active-row">
              <span className="drag-dots">⠿</span>
              <div>
                <strong>Welcome</strong>
                <small>Your cover and introduction</small>
              </div>
              <i />
            </div>
            <div className="edit-row">
              <span className="drag-dots">⠿</span>
              <div>
                <strong>About the business</strong>
                <small>Your story and details</small>
              </div>
              <i />
            </div>
            <div className="edit-row">
              <span className="drag-dots">⠿</span>
              <div>
                <strong>Hours & location</strong>
                <small>Help people plan a visit</small>
              </div>
              <i />
            </div>
          </div>
          <div className="phone-preview" aria-hidden="true">
            <div className="phone-speaker" />
            <div className="phone-cover">
              <small>DEMO SHOP</small>
              <strong>
                Made nearby.
                <br />
                Shared everywhere.
              </strong>
              <span />
            </div>
            <div className="phone-lines">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
        <div className="detail-copy">
          <span className="section-kicker">Calm tools, clear choices</span>
          <h2>You know your business. The product should feel just as familiar.</h2>
          <p>
            The experience is designed for a phone, uses everyday language, and introduces options
            only when they become useful.
          </p>
          <ul className="check-list">
            <li>
              <BadgeCheck size={20} /> A guided setup instead of one giant form
            </li>
            <li>
              <BadgeCheck size={20} /> Progress saved to your account
            </li>
            <li>
              <BadgeCheck size={20} /> Clear pickup and shop-managed delivery language
            </li>
            <li>
              <BadgeCheck size={20} /> No pretend payments, delivery fleet or hidden complexity
            </li>
          </ul>
        </div>
      </section>

      <section className="section shell faq-section" id="questions">
        <div className="faq-heading">
          <span className="section-kicker">Good to know</span>
          <h2>Straight answers, before you begin.</h2>
          <p>We would rather be clear about what the platform does than make a grand promise.</p>
        </div>
        <div className="faq-list">
          <details>
            <summary>What is the difference between an Online Presence and a Local Store?</summary>
            <p>
              An Online Presence is an informational, shareable business site. A Local Store adds
              products and local order requests for pickup or delivery managed by your business.
            </p>
          </details>
          <details>
            <summary>Does the platform take online payments?</summary>
            <p>
              Not in the first version. Local Store orders use payment on pickup or delivery, or a
              payment arrangement made directly with the merchant.
            </p>
          </details>
          <details>
            <summary>Will you deliver orders for my shop?</summary>
            <p>
              No. Local delivery is offered and managed by each shop. The platform does not provide
              riders, instant delivery estimates or courier dispatch.
            </p>
          </details>
          <details>
            <summary>Can I start with a business page and add ordering later?</summary>
            <p>
              That is the planned path: the same store can grow from Presence to Local Store while
              keeping its business details and link.
            </p>
          </details>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-orb final-orb-one" aria-hidden="true" />
        <div className="final-orb final-orb-two" aria-hidden="true" />
        <div className="shell final-cta-inner">
          <span className="section-kicker light-kicker">A better first step online</span>
          <h2>Make your business easier to find, understand and choose.</h2>
          <p>Sign in with Google, pick what you need, and we will remember where you left off.</p>
          <Link className="button button-light button-large" href="/login">
            Get started <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <Logo />
          <p>Thoughtful tools for independent local businesses in India.</p>
          <div className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
