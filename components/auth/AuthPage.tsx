"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2, ShieldCheck, Users, Sparkles, Mail, Lock, User, Briefcase } from "lucide-react";
import { auth, googleProvider, db } from "@/lib/firebase";

type AuthMode = "login" | "signup";
type UserRole = "user" | "official";

const copy: Record<AuthMode, { title: string; subtitle: string; cta: string; prompt: string; promptLink: string; promptHref: string }> = {
  login: {
    title: "Welcome back, Community Guardian",
    subtitle: "Sign in to see neighborhood progress and keep the momentum going.",
    cta: "Sign In",
    prompt: "New to CI Reporter?",
    promptLink: "Create an account",
    promptHref: "/signup",
  },
  signup: {
    title: "Join the Civic Action Network",
    subtitle: "Create an account to start reporting issues, tracking fixes, and inspiring change.",
    cta: "Sign Up",
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
  
  // Email/Password State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: userCredential.user.email,
          role: role,
          createdAt: new Date().toISOString(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push("/report");
    } catch (err) {
      if (err instanceof Error) {
        let msg = err.message;
        if (msg.includes("auth/invalid-email")) msg = "Invalid email address.";
        if (msg.includes("auth/user-not-found")) msg = "No account found with this email.";
        if (msg.includes("auth/wrong-password")) msg = "Incorrect password.";
        if (msg.includes("auth/email-already-in-use")) msg = "Email already in use.";
        setError(msg);
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const { title, subtitle, cta, prompt, promptLink, promptHref } = copy[mode];

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-16">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2">
        <section className="hidden lg:block rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-10 shadow-2xl">
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

        <section className="rounded-3xl border border-slate-800 bg-white/5 p-10 backdrop-blur flex flex-col justify-center">
          <div className="space-y-2 mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">CI Reporter</p>
            <h2 className="text-3xl font-bold text-white">{mode === "login" ? "Log in" : "Sign up"}</h2>
            <p className="text-slate-400">Enter your details below to continue.</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-slate-300">I am a...</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${
                      role === "user"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 bg-slate-900/30 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("official")}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${
                      role === "official"
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-slate-700 bg-slate-900/30 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Official
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-70 mt-6"
            >
              {loading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                cta
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm">
            <span className="h-[1px] flex-1 bg-slate-700" />
            or continue with
            <span className="h-[1px] flex-1 bg-slate-700" />
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/50 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-900">G</span>
            Google
          </button>

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
