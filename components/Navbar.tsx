"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Menu, Sparkles } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (current) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", current.uid));
        const userData = userDoc.data();
        setUserRole(userData?.role || "user");
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      await signOut(auth);
    } finally {
      setSigningOut(false);
    }
  };

  const dashboardPath = userRole === "official" ? "/official" : "/report";
  const isHomePage = pathname === "/";

  return (
    <nav className="fixed w-full bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-800 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg">
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CI<span className="text-emerald-500">Reporter</span></span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href={isHomePage ? "#features" : "/#features"} className="text-slate-400 hover:text-emerald-400 font-medium transition-colors text-sm">Features</Link>
            <Link href={isHomePage ? "#impact" : "/#impact"} className="text-slate-400 hover:text-emerald-400 font-medium transition-colors text-sm">Impact</Link>

            {user ? (
              <div className="flex items-center gap-3">
                {userRole !== "official" && (
                   <Link
                    href="/dashboard"
                     className={`text-sm font-semibold transition-colors ${pathname === "/dashboard" ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-400'}`}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href={dashboardPath}
                  className={`text-sm font-semibold transition-colors ${pathname === dashboardPath ? 'text-emerald-500' : 'text-emerald-400 hover:text-emerald-300'}`}
                >
                  {userRole === "official" ? "Official Dashboard" : "Report Issue"}
                </Link>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {user.displayName || user.email || "Logged in"}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="text-sm font-semibold text-slate-300 hover:text-emerald-300 disabled:opacity-60"
                >
                  {signingOut ? "Signing out..." : "Log out"}
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-white font-medium hover:text-emerald-400 transition-colors text-sm">Log in</Link>
                <Link 
                  href="/signup" 
                  className="bg-emerald-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              href={isHomePage ? "#features" : "/#features"}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link 
              href={isHomePage ? "#impact" : "/#impact"}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Impact
            </Link>
            
            {user ? (
              <>
                 {userRole !== "official" && (
                   <Link
                    href="/dashboard"
                     className={`block px-3 py-2 text-base font-medium rounded-lg ${pathname === "/dashboard" ? 'text-emerald-500 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                     onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href={dashboardPath}
                  className={`block px-3 py-2 text-base font-medium rounded-lg ${pathname === dashboardPath ? 'text-emerald-500 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {userRole === "official" ? "Official Dashboard" : "Report Issue"}
                </Link>
                <div className="border-t border-slate-800 my-2 pt-2">
                   <div className="px-3 py-2 text-sm text-slate-500">
                      Signed in as <span className="text-emerald-400">{user.displayName || user.email}</span>
                   </div>
                   <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    disabled={signingOut}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg"
                  >
                    {signingOut ? "Signing out..." : "Log out"}
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-slate-800 my-2 pt-2 space-y-2">
                <Link 
                  href="/login" 
                  className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  className="block px-3 py-2 text-base font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-center"
                   onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
