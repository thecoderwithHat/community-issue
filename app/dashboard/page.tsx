"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
// Note: We'll infer the type from the data or define a local interface that matches what we're saving
import { User, Mail, Calendar, MapPin, Clock, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

interface IssueData {
  id: string;
  analysis: {
    title: string;
    summary: string;
    issueType: string;
    severity: string;
    urgency: string;
    status: string;
    department: string;
  };
  location?: { lat: number; lng: number };
  submittedAt: string;
  status: string;
}

function DashboardContent() {
  const [user, setUser] = useState(auth.currentUser);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchIssues(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchIssues = async (userId: string) => {
    try {
      const q = query(
        collection(db, "issues"), 
        where("userId", "==", userId)
        // Note: Composite index might be needed for orderBy with where, so we sort client-side for now
      );
      
      const querySnapshot = await getDocs(q);
      const issuesList: IssueData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        issuesList.push({
          id: doc.id,
          ...data
        } as IssueData);
      });

      // Sort by submittedAt descending
      issuesList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      setIssues(issuesList);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeIssues = issues.filter(i => i.status !== 'Resolved');
  const historyIssues = issues.filter(i => i.status === 'Resolved');

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        
        {/* Profile Header */}
        <div className="mb-12 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/30 flex items-center justify-center text-4xl font-bold text-emerald-500 shadow-xl shadow-emerald-900/20">
                {user?.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt="Profile" 
                    width={96} 
                    height={96} 
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-4 border-slate-900">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {user?.displayName || 'Community Member'}
              </h1>
              <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Citizen ID: {user?.uid.substring(0, 8)}...</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto mt-6 md:mt-0">
               <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex-1 md:flex-none text-center min-w-[100px]">
                 <div className="text-2xl font-bold text-white">{issues.length}</div>
                 <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total</div>
               </div>
               <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex-1 md:flex-none text-center min-w-[100px]">
                 <div className="text-2xl font-bold text-emerald-400">{historyIssues.length}</div>
                 <div className="text-xs text-emerald-500/70 uppercase tracking-wider font-semibold">Resolved</div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* Active Issues Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Active Issues</h2>
              <span className="ml-auto bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-400">
                {activeIssues.length} found
              </span>
            </div>

            <div className="space-y-4">
              {activeIssues.length === 0 ? (
                <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 text-center space-y-3 border-dashed">
                  <div className="inline-flex p-3 rounded-full bg-slate-800/50 text-slate-500 mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-white">All Clear!</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    You don&apos;t have any active issues being tracked right now.
                  </p>
                </div>
              ) : (
                activeIssues.map((issue) => (
                  <div key={issue.id} className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-900/10 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${issue.analysis.severity?.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            issue.analysis.severity?.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {issue.analysis.severity} Priority
                        </span>
                        <h3 className="font-semibold text-white text-lg line-clamp-1">{issue.analysis.title}</h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                        <Clock className="w-3 h-3" />
                        {issue.status}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                      {issue.analysis.summary}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(issue.submittedAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {issue.location ? `${issue.location.lat.toFixed(3)}, ${issue.location.lng.toFixed(3)}` : 'No Location'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* History Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Resolution History</h2>
               <span className="ml-auto bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-400">
                {historyIssues.length} records
              </span>
            </div>

            <div className="space-y-4">
               {historyIssues.length === 0 ? (
                <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 text-center space-y-3 border-dashed">
                  <div className="inline-flex p-3 rounded-full bg-slate-800/50 text-slate-500 mb-2">
                    <Timer className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-white">No history yet</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Once your submitted issues are resolved, they will appear here.
                  </p>
                </div>
              ) : (
                historyIssues.map((issue) => (
                  <div key={issue.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-300 text-base line-clamp-1">{issue.analysis.title}</h3>
                      <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Resolved</span>
                    </div>
                    <p className="text-slate-500 text-xs mb-3">
                      Ticket ID: {issue.id}
                    </p>
                     <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span>Submitted: {formatDate(issue.submittedAt)}</span>
                        <span>•</span>
                        <span>{issue.analysis.department}</span>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
