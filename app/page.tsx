import Link from "next/link";
import { ArrowRight, CheckCircle, Users, Zap, Shield, Menu } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-extrabold text-blue-600 tracking-tight">CI<span className="text-gray-900">Reporter</span></span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</Link>
              <Link href="#impact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Impact</Link>
              <Link href="/login" className="text-gray-900 font-medium hover:text-blue-600 transition-colors">Log in</Link>
              <Link 
                href="/signup" 
                className="bg-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
              >
                Sign up
              </Link>
            </div>

            <div className="md:hidden">
              <button className="text-gray-500 hover:text-gray-900">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 mb-8 border border-blue-100 bg-blue-50 text-blue-700 font-medium text-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
              Community Driven Initiative
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 tracking-tight mb-8 leading-tight">
              Empowering Citizens,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Transforming Communities</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              The AI-powered platform that bridges the gap between citizens and authorities. 
              Report issues instantly, track resolutions, and build a better neighborhood together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/report" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
              >
                Report an Issue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 hover:border-gray-300 rounded-full font-semibold text-lg transition-all"
              >
                Join the Community
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Decorative */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CI Reporter?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">We combine cutting-edge AI with community power to ensure your voice is heard and acted upon.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-blue-600" />}
              title="AI-Powered Classification"
              description="Simply upload a photo. Our Gemini-powered AI instantly categorizes the issue, assesses severity, and routes it to the right department."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-indigo-600" />}
              title="Transparent Tracking"
              description="No more black holes. Track your complaint status in real-time from submission to resolution with automated updates."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-purple-600" />}
              title="Community Impact"
              description="See how your reports contribute to neighborhood improvements. Earn trust points and become a verified community guardian."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Real Change, Real Fast.</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
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
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-200">{item}</span>
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
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold text-gray-900">CI<span className="text-blue-600">Reporter</span></div>
          <div className="flex gap-8 text-gray-500 text-sm font-medium">
            <Link href="#" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-900">Contact Support</Link>
          </div>
          <p className="text-gray-400 text-sm">© 2026 Community Issue Reporter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center">
      <div className="text-3xl font-bold text-white mb-1">{number}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}
