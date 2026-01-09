"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Camera, Mic, MapPin, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { IssueAnalysis, ComplaintStatus } from "../types";

export default function Home() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IssueAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusPillStyles: Record<ComplaintStatus, string> = {
    Submitted: "bg-gray-100 text-gray-800 border-gray-200",
    "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
    Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const timelineDotStyles: Record<ComplaintStatus, string> = {
    Submitted: "bg-gray-400",
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
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
            AI Community Issue Reporter 🏙️
          </h1>
          <p className="text-gray-600">
            Report civic issues instantly using AI assistant
          </p>
        </div>

        {/* Reporting Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Options */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Describe the Issue
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., There is a huge pothole on Main Street hindering traffic..."
                className="w-full text-black p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none min-h-[120px]"
              />
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Camera className="w-5 h-5 text-blue-600" />
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
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Get current location"
                >
                  {gettingLocation ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : <MapPin className="w-5 h-5 text-red-500" />}
                  <span className="text-sm font-medium">{location ? "Loc. Set" : "Location"}</span>
                </button>
                
                {/* Placeholder for Voice - functionality not implemented in MVP */}
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl cursor-not-allowed"
                  title="Voice input coming soon"
                >
                  <Mic className="w-5 h-5" />
                  <span className="text-sm font-medium">Voice</span>
                </button>
              </div>

              {image && (
                <div className="relative h-48 rounded-xl overflow-hidden border border-gray-200 mt-4">
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
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    X
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Image attached
                  </div>
                </div>
              )}
            </div>

            {error && (
               <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                 <p className="text-sm">{error}</p>
               </div>
            )}

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Analysis Complete</h2>
                <p className="text-sm text-gray-500">Proposed classification & routing</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Issue Type</label>
                  <div className="text-lg font-medium text-gray-900">{result.issueType}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Severity</label>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                    ${result.severity?.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' : 
                      result.severity?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {result.severity}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</label>
                  <div className="text-lg font-medium text-gray-900">{result.department}</div>
                </div>
              </div>

              <div className="space-y-4">
                 <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggested Title</label>
                  <div className="text-base text-gray-900">{result.title}</div>
                </div>
                 <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Summary</label>
                  <div className="text-base text-gray-600 leading-relaxed">{result.summary}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Urgency</label>
                  <div className="text-base font-medium text-blue-600">{result.urgency}</div>
                </div>
                {result.keywords && result.keywords.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Keywords</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.routing && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Authority</label>
                    <div className="mt-1 text-base font-semibold text-gray-900">{result.routing.department}</div>
                    <p className="text-sm text-gray-500">{result.routing.notes}</p>
                    <div className="mt-4 grid gap-3 text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Jurisdiction: <span className="font-normal">{result.routing.jurisdiction}</span></span>
                      <span className="font-medium text-gray-700">Response SLA: <span className="font-normal">{result.routing.responseSLA}</span></span>
                      <span className="font-medium text-gray-700">Contact: <span className="font-normal">{result.routing.contact}</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {result.history && result.history.length > 0 && (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white/60 p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Complaint Tracking</p>
                    <p className="text-lg font-bold text-gray-900">ID: {result.complaintId}</p>
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
                        <span className={`h-3 w-3 rounded-full ${timelineDotStyles[entry.status]}`} />
                        {index < result.history.length - 1 && <span className="mt-1 h-full w-px bg-gray-200" />}
                      </div>
                      <div className="flex-1 rounded-xl bg-gray-50 p-3">
                        <p className="text-sm font-semibold text-gray-900">{entry.status}</p>
                        <p className="text-xs text-gray-500">{formatTimelineTime(entry.timestamp)}</p>
                        <p className="mt-1 text-sm text-gray-600">{entry.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
               <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {location 
                      ? `Location Tagged: ${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E` 
                      : "Location not tagged (Mock: 12.9716° N, 77.5946° E)"}
                  </span>
               </div>
            </div>
            
            <button className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors">
              Confirm & Officially Report
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
