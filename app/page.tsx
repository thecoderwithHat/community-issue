"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Users, Zap, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 mb-8 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium text-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Community Driven Initiative
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
              Empowering Citizens,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Transforming Communities</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The AI-powered platform that bridges the gap between citizens and authorities. 
              Report issues instantly, track resolutions, and build a better neighborhood together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/report" 
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                Report an Issue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-semibold text-lg transition-all"
              >
                Join the Community
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Decorative */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose CI Reporter?</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">We combine cutting-edge AI with community power to ensure your voice is heard and acted upon.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-emerald-400" />}
              title="AI-Powered Classification"
              description="Simply upload a photo. Our Gemini-powered AI instantly categorizes the issue, assesses severity, and routes it to the right department."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-cyan-400" />}
              title="Transparent Tracking"
              description="No more black holes. Track your complaint status in real-time from submission to resolution with automated updates."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-indigo-400" />}
              title="Community Impact"
              description="See how your reports contribute to neighborhood improvements. Earn trust points and become a verified community guardian."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Real Change, Real Fast.</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Our platform has revolutionized how civic issues are handled. By removing bureaucratic friction, we&rsquo;ve reduced resolution times by 40% in pilot wards.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Automatic Department Routing",
                  "Duplicate Report Detection",
                  "Severity-based Prioritization",
                  "Direct feedback loops with officials"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <StatCard number="10k+" label="Issues Reported" />
                <StatCard number="85%" label="Resolution Rate" />
                <StatCard number="24h" label="Avg. Response" />
                <StatCard number="50+" label="Partner Zones" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold text-white">CI<span className="text-emerald-500">Reporter</span></div>
          <div className="flex gap-8 text-slate-500 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
          <p className="text-slate-600 text-sm">© 2026 Community Issue Reporter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group">
      <div className="bg-slate-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-slate-800 group-hover:border-emerald-500/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 text-center hover:border-emerald-500/30 transition-colors">
      <div className="text-3xl font-bold text-white mb-1">{number}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
