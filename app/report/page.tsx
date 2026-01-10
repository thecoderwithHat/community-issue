"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Camera, Mic, MapPin, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { IssueAnalysis, ComplaintStatus } from "../types";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

function ReportContent() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IssueAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusPillStyles: Record<ComplaintStatus, string> = {
    Submitted: "bg-slate-800 text-slate-300 border-slate-700",
    "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const timelineDotStyles: Record<ComplaintStatus, string> = {
    Submitted: "bg-slate-600",
    "In Progress": "bg-amber-500",
    Resolved: "bg-emerald-500",
  };

  const formatTimelineTime = (timestamp: string | null) => {
    if (!timestamp) {
      return "Pending update";
    }
    return new Date(timestamp).toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingLocation(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location. Please enable location services.");
        setGettingLocation(false);
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !image) {
      setError("Please provide a description or an image.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, image, location }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 p-4 md:p-8 pt-24 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center rounded-full px-3 py-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium text-xs mb-4">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              AI-Powered Analysis
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Report an Issue
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Help us improve your neighborhood. Describe the issue or upload a photo, and our AI will handle the rest.
          </p>
        </div>

        {/* Reporting Form */}
        <div className="bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Options */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                Describe the Issue
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., There is a huge pothole on Main Street hindering traffic..."
                className="w-full bg-slate-950 text-white p-4 border border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none min-h-[120px] placeholder:text-slate-600"
              />
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Camera className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">Add Photo</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                
                <button
                  type="button"
                  onClick={getLocation}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white transition-colors"
                  title="Get current location"
                >
                  {gettingLocation ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" /> : <MapPin className="w-5 h-5 text-red-400" />}
                  <span className="text-sm font-medium">{location ? "Loc. Set" : "Location"}</span>
                </button>
                
                {/* Placeholder for Voice - functionality not implemented in MVP */}
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 text-slate-600 border border-slate-800 rounded-xl cursor-not-allowed"
                  title="Voice input coming soon"
                >
                  <Mic className="w-5 h-5" />
                  <span className="text-sm font-medium">Voice</span>
                </button>
              </div>

              {image && (
                <div className="relative h-48 rounded-xl overflow-hidden border border-slate-700 mt-4 bg-slate-950">
                  <Image
                    src={image}
                    alt="Issue preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm"
                  >
                    <span className="sr-only">Remove</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white/90 text-xs px-2.5 py-1 rounded-md border border-white/10">
                    Image attached
                  </div>
                </div>
              )}
            </div>

            {error && (
               <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                 <p className="text-sm">{error}</p>
               </div>
            )}

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Issue...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Analysis Complete</h2>
                <p className="text-sm text-slate-400">Proposed classification & routing</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue Type</label>
                  <div className="text-lg font-medium text-white">{result.issueType}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</label>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border
                    ${result.severity?.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      result.severity?.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {result.severity}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</label>
                  <div className="text-lg font-medium text-white">{result.department}</div>
                </div>
              </div>

              <div className="space-y-4">
                 <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggested Title</label>
                  <div className="text-base text-white">{result.title}</div>
                </div>
                 <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Summary</label>
                  <div className="text-base text-slate-400 leading-relaxed">{result.summary}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Urgency</label>
                  <div className="text-base font-medium text-emerald-400">{result.urgency}</div>
                </div>
                {result.keywords && result.keywords.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Keywords</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.routing && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Authority</label>
                    <div className="mt-1 text-base font-semibold text-white">{result.routing.department}</div>
                    <p className="text-sm text-slate-500">{result.routing.notes}</p>
                    <div className="mt-4 grid gap-3 text-sm text-slate-400">
                      <span className="font-medium text-slate-300">Jurisdiction: <span className="font-normal text-slate-400">{result.routing.jurisdiction}</span></span>
                      <span className="font-medium text-slate-300">Response SLA: <span className="font-normal text-slate-400">{result.routing.responseSLA}</span></span>
                      <span className="font-medium text-slate-300">Contact: <span className="font-normal text-slate-400">{result.routing.contact}</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {result.history && result.history.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-800/40 p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Complaint Tracking</p>
                    <p className="text-lg font-bold text-white">ID: {result.complaintId}</p>
                  </div>
                  {result.status && (
                    <span className={`inline-flex items-center rounded-full border px-4 py-1 text-sm font-semibold ${statusPillStyles[result.status]}`}>
                      Current Status: {result.status}
                    </span>
                  )}
                </div>

                <ol className="mt-6 space-y-4">
                  {result.history.map((entry, index) => (
                    <li key={`${entry.status}-${index}`} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={`h-3 w-3 rounded-full ring-4 ring-slate-900 ${timelineDotStyles[entry.status]}`} />
                        {index < result.history.length - 1 && <span className="mt-1 h-full w-px bg-slate-700" />}
                      </div>
                      <div className="flex-1 rounded-xl bg-slate-900 border border-slate-800 p-3">
                        <p className="text-sm font-semibold text-white">{entry.status}</p>
                        <p className="text-xs text-slate-500">{formatTimelineTime(entry.timestamp)}</p>
                        <p className="mt-1 text-sm text-slate-400">{entry.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-800">
               <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {location 
                      ? `Location Tagged: ${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E` 
                      : "Location not tagged (Mock: 12.9716° N, 77.5946° E)"}
                  </span>
               </div>
            </div>
            
            <button 
              onClick={async () => {
                if (!result) return;
                try {
                  const response = await fetch("/api/submit-report", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ analysis: result, location }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.error || "Failed to submit report");
                  }

                  setError(null);
                  setResult(null);
                  setDescription("");
                  setImage(null);
                  alert(`Report submitted successfully! Complaint ID: ${data.complaintId}`);
                } catch (err) {
                  if (err instanceof Error) {
                    setError(err.message);
                  } else {
                    setError("Failed to submit report");
                  }
                }
              }}
              className="w-full mt-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all">
              Confirm & Officially Report
            </button>
          </div>
        )}
      </div>
    </main>
    </ProtectedRoute>
  );
}

export default function Home() {
  return <ReportContent />;
}
