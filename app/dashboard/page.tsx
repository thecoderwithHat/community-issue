"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { IssueAnalysis } from '../types';
// Note: We'll infer the type from the data or define a local interface that matches what we're saving
import { User, Mail, Calendar, MapPin, Clock, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

interface IssueData {
  id: string;
  analysis: IssueAnalysis;
  location?: { lat: number; lng: number };
  submittedAt: string;
  status: string;
}

function DashboardContent() {
  const [user, setUser] = useState(auth.currentUser);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<IssueData | null>(null);

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
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 max-w-full">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 max-w-full">
                  <User className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">Citizen ID: {user?.uid.substring(0, 8)}...</span>
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
                  <button 
                    key={issue.id} 
                    onClick={() => setSelectedIssue(issue)}
                    className="w-full text-left group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-900/10 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
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
                    
                    <div className="flex flex-wrap items-center justify-between gap-y-2 pt-4 border-t border-slate-800 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-emerald-500/70" />
                        {formatDate(issue.submittedAt)}
                      </div>
                      <div className="flex items-center gap-2 max-w-[180px]">
                        <MapPin className="w-3 h-3 text-red-500/70" />
                        <span className="truncate">{issue.location ? `${issue.location.lat.toFixed(3)}, ${issue.location.lng.toFixed(3)}` : 'No Location'}</span>
                      </div>
                    </div>
                  </button>
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
                  <button 
                    key={issue.id} 
                    onClick={() => setSelectedIssue(issue)}
                    className="w-full text-left p-5 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-300 text-base line-clamp-1">{issue.analysis.title}</h3>
                      <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Resolved</span>
                    </div>
                    <p className="text-slate-500 text-xs mb-3">
                      Ticket ID: {issue.id}
                    </p>
                     <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-slate-600">
                        <span>{formatDate(issue.submittedAt)}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="truncate">{issue.analysis.department}</span>
                     </div>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedIssue(null)}
        >
          <div 
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider
                      ${selectedIssue.analysis.severity?.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        selectedIssue.analysis.severity?.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {selectedIssue.analysis.severity} Priority
                    </span>
                    <span className="text-slate-500 text-xs font-mono">ID: {selectedIssue.id}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{selectedIssue.analysis.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Issue Summary</h4>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    {selectedIssue.analysis.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</h4>
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                      <Clock className="w-4 h-4" />
                      <span className="truncate">{selectedIssue.status}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Urgency</h4>
                    <div className="text-white font-medium truncate">{selectedIssue.analysis.urgency}</div>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</h4>
                    <div className="text-white font-medium truncate">{selectedIssue.analysis.issueType}</div>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dept</h4>
                    <div className="text-white font-medium truncate">{selectedIssue.analysis.department}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>Submitted {formatDate(selectedIssue.submittedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span>{selectedIssue.location ? `${selectedIssue.location.lat.toFixed(4)}, ${selectedIssue.location.lng.toFixed(4)}` : 'Location not provided'}</span>
                  </div>
                </div>

                {selectedIssue.analysis.history && selectedIssue.analysis.history.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/50">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Tracking History</h4>
                    <div className="space-y-4">
                      {selectedIssue.analysis.history.map((entry, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full ${entry.status === 'Resolved' ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                            {idx !== selectedIssue.analysis.history.length - 1 && <div className="w-px h-full bg-slate-800 my-1"></div>}
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-bold text-white leading-none">{entry.status}</p>
                            <p className="text-xs text-slate-500 mt-1">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Pending'}</p>
                            <p className="text-sm text-slate-400 mt-2 italic">&quot;{entry.note}&quot;</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all border border-slate-700 hover:border-slate-600"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
