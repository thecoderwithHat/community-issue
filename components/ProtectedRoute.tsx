"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "official" | "any";
}

export default function ProtectedRoute({ children, requiredRole = "any" }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (requiredRole === "any") {
          setAuthorized(true);
        } else {
          // Fetch user role from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            const userData = userDoc.data();
            
            if (userData && userData.role === requiredRole) {
              setAuthorized(true);
            } else if (!userData) {
              // User signed up with Google - default to "user" role
              if (requiredRole === "user") {
                setAuthorized(true);
              } else {
                router.push("/unauthorized");
                setAuthorized(false);
              }
            } else {
              // Role mismatch
              router.push("/unauthorized");
              setAuthorized(false);
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            setAuthorized(false);
            router.push("/login");
          }
        }
      } else {
        setAuthorized(false);
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-red-400">Unauthorized access.</p>
      </div>
    );
  }

  return <>{children}</>;
}
