'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Demo layout - No authentication required
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold calliq-brand-white">CalliQ</span>
              <span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold">
                DEMO
              </span>
            </div>
            {/* Enhanced Navigation */}
            <nav className="flex items-center space-x-4 md:space-x-6">
              <Link 
                href="/demo/calliq/dashboard"
                className={`text-sm md:text-base text-white/80 hover:text-white transition-colors ${
                  pathname === '/demo/calliq/dashboard' ? 'text-white font-semibold' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/demo/calliq/upload"
                className={`text-sm md:text-base text-white/80 hover:text-white transition-colors ${
                  pathname === '/demo/calliq/upload' ? 'text-white font-semibold' : ''
                }`}
              >
                Try Analysis
              </Link>
              <Link 
                href="/demo/calliq/insights"
                className={`text-sm md:text-base text-white/80 hover:text-white transition-colors ${
                  pathname === '/demo/calliq/insights' ? 'text-white font-semibold' : ''
                }`}
              >
                Insights
              </Link>
              <Link 
                href="/demo/calliq/features"
                className={`text-sm md:text-base text-white/80 hover:text-white transition-colors ${
                  pathname === '/demo/calliq/features' ? 'text-white font-semibold' : ''
                }`}
              >
                Features
              </Link>
              <a 
                href="/login" 
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                Start Free Trial
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">🎯 This is a demo</span> showing CalliQ's capabilities with sample data. 
            <a href="/login" className="ml-2 text-blue-600 hover:text-blue-800 font-semibold">
              Sign up for free
            </a> to analyze your own calls.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Demo Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ready to improve your sales?</h3>
              <p className="text-sm text-gray-600">
                Join 500+ sales teams using CalliQ to win more deals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Sales</h3>
              <p className="text-sm text-gray-600">
                Email: connect@conversailabs.com<br />
                <a 
                  href="https://wa.me/+918076018082?text=Hi!%20I%20would%20like%20to%20know%20more%20about%20CalliQ."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 font-medium hover:underline"
                >
                  Directly Connect With CEO
                </a>
              </p>
            </div>
            <div>
              <a 
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Your Free Trial
              </a>
              <p className="text-xs text-gray-500 mt-2">No credit card required</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}