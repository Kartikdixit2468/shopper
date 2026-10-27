import { Eye, FileText, LayoutDashboard, LogOut, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { signOutUser } from "@/app/actions/auth";
import { Logo } from "@/components/logo";

type MerchantShellProps = {
  active: "overview" | "website" | "listings" | "settings";
  storeName: string | null;
  storeSlug: string | null;
  published: boolean;
  children: ReactNode;
};

const links = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { id: "website", label: "Edit website", href: "/dashboard/website", icon: Sparkles },
  { id: "listings", label: "Listings", href: "/dashboard/listings", icon: FileText },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

export function MerchantShell({
  active,
  storeName,
  storeSlug,
  published,
  children,
}: MerchantShellProps) {
  return (
    <main className="merchant-app">
      <aside className="merchant-sidebar">
        <div>
          <Logo href="/dashboard" />
          <div className="merchant-store-chip">
            <span>{(storeName || "Your shop").charAt(0).toUpperCase()}</span>
            <div>
              <strong>{storeName || "Your shop"}</strong>
              <small>{published ? "Published" : "Draft"}</small>
            </div>
          </div>
          <nav aria-label="Merchant dashboard">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <Link className={active === item.id ? "active" : ""} href={item.href} key={item.id}>
                  <Icon size={18} /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="merchant-sidebar-bottom">
          {storeSlug ? (
            <Link href={published ? `/s/${storeSlug}` : "/dashboard/preview"} target="_blank">
              <Eye size={18} /> {published ? "View live site" : "Preview draft"}
            </Link>
          ) : null}
          <form action={signOutUser}>
            <button type="submit">
              <LogOut size={18} /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <section className="merchant-workspace">
        <header className="merchant-mobile-header">
          <Logo href="/dashboard" />
          <Link href="/dashboard/website">Edit site</Link>
        </header>
        {children}
        <nav className="merchant-mobile-nav" aria-label="Merchant dashboard">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link className={active === item.id ? "active" : ""} href={item.href} key={item.id}>
                <Icon size={19} /> <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </section>
    </main>
  );
}
