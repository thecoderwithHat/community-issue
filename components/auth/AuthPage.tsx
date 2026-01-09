"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { Loader2, ShieldCheck, Users, Sparkles } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";

type AuthMode = "login" | "signup";

const copy: Record<AuthMode, { title: string; subtitle: string; cta: string; prompt: string; promptLink: string; promptHref: string }> = {
  login: {
    title: "Welcome back, Community Guardian",
    subtitle: "Sign in to see neighborhood progress and keep the momentum going.",
    cta: "Continue with Google",
    prompt: "New to CI Reporter?",
    promptLink: "Create an account",
    promptHref: "/signup",
  },
  signup: {
    title: "Join the Civic Action Network",
    subtitle: "Create an account to start reporting issues, tracking fixes, and inspiring change.",
    cta: "Sign up with Google",
    prompt: "Already part of the movement?",
    promptLink: "Log in",
    promptHref: "/login",
  },
};

interface AuthPageProps {
  mode: AuthMode;
}

export default function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      router.push("/report");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to connect to Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const { title, subtitle, cta, prompt, promptLink, promptHref } = copy[mode];

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-16">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-10 shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/50 px-4 py-1 text-sm text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Community Impact Center
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">{subtitle}</p>

          <div className="mt-10 space-y-6 text-slate-200">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Verified Escalations</p>
                <p className="mt-1 text-base text-slate-200">AI-assisted routing ensures every report reaches the right authority within minutes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Collective Progress</p>
                <p className="mt-1 text-base text-slate-200">Unlock ward-level dashboards, transparency timelines, and recognition badges.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-white/5 p-10 backdrop-blur">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">CI Reporter</p>
            <h2 className="text-3xl font-bold text-white">{mode === "login" ? "Log in" : "Sign up"}</h2>
            <p className="text-slate-400">Use your verified Google identity to stay accountable & authentic.</p>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-base font-semibold text-gray-900 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-900">G</span>
            )}
            {cta}
          </button>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="h-[1px] flex-1 bg-slate-700" />
              or
              <span className="h-[1px] flex-1 bg-slate-700" />
            </div>
            <p>
              Need help connecting your municipal account? <a href="mailto:support@cireporter.io" className="font-semibold text-emerald-300 hover:text-emerald-200">Contact support</a> and we&rsquo;ll set you up.
            </p>
          </div>

          <div className="mt-10 text-center text-sm text-slate-400">
            {prompt}&nbsp;
            <Link href={promptHref} className="font-semibold text-white underline-offset-4 hover:text-emerald-300">
              {promptLink}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
