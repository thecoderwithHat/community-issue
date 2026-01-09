"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setUserRole(userData?.role || "user");
      }
    });
    return () => unsubscribe();
  }, []);

  const redirectPath = userRole === "official" ? "/official" : "/report";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
            <ShieldX className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-400 text-lg">
            You don&apos;t have permission to access this page. This area is restricted based on your account role.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href={redirectPath}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <ArrowLeft className="h-5 w-5" />
            Go to your dashboard
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-all"
          >
            <Home className="h-5 w-5" />
            Back to home
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
