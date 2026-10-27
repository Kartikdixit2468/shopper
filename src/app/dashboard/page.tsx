import {
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  LogOut,
  Store as StoreIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOutUser } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storeModeContent } from "@/lib/store-mode";

export const metadata: Metadata = { title: "Your draft" };
export const dynamic = "force-dynamic";

type DashboardProps = { searchParams: Promise<{ created?: string }> };

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const store = await prisma.store.findUnique({ where: { ownerUserId: user.id } });
  if (!store) redirect("/onboarding/type");

  const params = await searchParams;
  const mode = storeModeContent[store.type];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="shell dashboard-header-inner">
          <Logo href="/dashboard" />
          <form action={signOutUser}>
            <button className="dashboard-signout" type="submit">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="shell dashboard-main">
        {params.created === "1" ? (
          <div className="success-banner" role="status">
            <CheckCircle2 size={20} /> Your choice is saved. This draft will be here when you
            return.
          </div>
        ) : null}

        <div className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">Your business workspace</span>
            <h1>
              Good to see you
              {user.user_metadata.full_name
                ? `, ${String(user.user_metadata.full_name).split(" ")[0]}`
                : ""}
              .
            </h1>
            <p>Your {mode.label} draft is secure and ready for the next setup step.</p>
          </div>
          <span className="draft-pill">
            <CircleDot size={14} /> Draft
          </span>
        </div>

        <div className="dashboard-grid">
          <section className="draft-overview">
            <div className="draft-overview-top">
              <span className="dashboard-store-icon">
                <StoreIcon size={25} />
              </span>
              <div>
                <span className="dashboard-label">Selected store type</span>
                <h2>{mode.title}</h2>
              </div>
            </div>
            <p>{mode.description}</p>
            <div className="draft-facts">
              <div>
                <Clock3 size={18} />
                <span>
                  <small>Status</small>
                  <strong>Draft saved</strong>
                </span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>
                  <small>Next step</small>
                  <strong>Business basics</strong>
                </span>
              </div>
            </div>
          </section>

          <aside className="slice-boundary-card">
            <span className="section-kicker">Slice 1 complete</span>
            <h2>Your starting point is ready.</h2>
            <p>
              Guided business setup belongs to the next Presence slice and is intentionally not
              presented as active yet. Your account and store choice are already persisted.
            </p>
            <div className="future-step" aria-disabled="true">
              Continue to business basics <ArrowUpRight size={17} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
