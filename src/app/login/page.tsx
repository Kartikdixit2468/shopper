import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signInWithGoogle } from "@/app/actions/auth";
import { GoogleIcon } from "@/components/google-icon";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseAuthConfigured } from "@/lib/config";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; reason?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/start");

  const params = await searchParams;
  const configured = isSupabaseAuthConfigured();
  const hasAuthError = Boolean(params.error);

  return (
    <main className="auth-shell">
      <div className="auth-brand-pane">
        <div className="auth-brand-wash" aria-hidden="true" />
        <Logo />
        <div className="auth-brand-copy">
          <span className="section-kicker">Your next chapter online</span>
          <h1>One account. One simple place for your business.</h1>
          <p>
            Sign in securely, choose what you want to create, and come back to your saved progress
            whenever you need.
          </p>
          <div className="auth-points">
            <span>
              <BadgeCheck size={18} /> A clear choice after sign-in
            </span>
            <span>
              <BadgeCheck size={18} /> Your draft saved to your account
            </span>
            <span>
              <BadgeCheck size={18} /> No password for you to remember
            </span>
          </div>
        </div>
        <div className="auth-demo-card" aria-hidden="true">
          <span className="auth-demo-logo">YS</span>
          <div>
            <strong>Your shop</strong>
            <small>Ready to make your own</small>
          </div>
          <span className="auth-demo-status">Draft saved</span>
        </div>
      </div>

      <div className="auth-form-pane">
        <div className="auth-form-wrap">
          <Link className="back-link" href="/">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="auth-form-heading">
            <span className="auth-step">Get started</span>
            <h2>Welcome</h2>
            <p>Use your Google account to begin or continue your business draft.</p>
          </div>

          {hasAuthError ? (
            <div className="inline-alert error-alert" role="alert">
              Google sign-in could not be completed. Please try again. If the problem continues,
              check the Supabase Google provider and redirect URL settings.
            </div>
          ) : null}

          {params.reason === "session" ? (
            <div className="inline-alert" role="status">
              Your session ended. Sign in again to continue safely.
            </div>
          ) : null}

          {configured ? (
            <form action={signInWithGoogle}>
              <button className="google-button" type="submit">
                <GoogleIcon /> Continue with Google
              </button>
            </form>
          ) : (
            <div className="configuration-card" role="status">
              <strong>Supabase Auth needs configuration</strong>
              <p>
                Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, then enable Google in Supabase
                Auth. No development-only fake login is enabled.
              </p>
            </div>
          )}

          <div className="security-note">
            <ShieldCheck size={18} />
            <p>
              Google authentication and the secure session are handled through Supabase Auth. Your
              Google password is never shared with this application.
            </p>
          </div>
          <p className="legal-copy">
            By continuing, you acknowledge the current beta <Link href="/terms">terms</Link> and{" "}
            <Link href="/privacy">privacy notice</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
