"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { user, agent, loading, signOut } = useAuth();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !agent) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="px-4 py-6 sm:px-6 lg:px-8 xl:px-12 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-gray-900 mb-1 lg:text-xl xl:text-2xl">
                Hi {agent.agent_name}, Let&apos;s boost your online visibility...
              </h1>
              <p className="text-sm text-gray-600">
                {agent.company_name}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Profile Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {agent.agent_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{agent.agent_name}</p>
                    <p className="text-sm text-gray-600">{agent.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => router.push('/profile')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={signOut}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 pb-20 lg:pb-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-12 space-y-6 lg:space-y-0 mt-6">
            
            {/* Left Column - Top Recommendations */}
            <div className="lg:order-1">
              <h2 className="text-sm font-medium text-gray-600 mb-3 lg:text-base xl:text-lg">
                Top Recommendations
              </h2>
              
            {/* Hero Card */}
            <button
              onClick={() => router.push('/website-builder')}
              className="relative rounded-2xl p-6 lg:p-8 xl:p-10 text-white overflow-hidden h-48 lg:h-64 xl:h-80 w-full text-left hover:scale-105 transition-transform duration-200"
            >
              <Image
                src="/assets/website_builder/websitegradient.png"
                alt="Website gradient background"
                fill
                className="object-cover rounded-2xl"
                priority
              />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold leading-tight mb-2 lg:text-3xl xl:text-4xl">
                  Build your own<br />Website.
                </h3>
                <p className="text-sm opacity-90 mt-4 lg:text-base xl:text-lg">
                  Try our website builder for free
                </p>
              </div>
            </button>
            </div>

            {/* Right Column - Platform Selection */}
            <div className="lg:order-2">
              <h2 className="text-sm font-medium text-gray-600 mb-4 lg:text-base xl:text-lg">
                Select a platform for content generation:
              </h2>
              
              <div className="space-y-3 lg:space-y-4">
              {/* Facebook */}
              <button 
                onClick={() => router.push('/facebook')}
                className="w-full flex items-center gap-4 p-4 lg:p-5 xl:p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 relative flex-shrink-0">
                    <Image
                      src="/assets/website_builder/facebook.png"
                      alt="Facebook"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-gray-900 font-medium lg:text-lg xl:text-xl">Facebook</span>
                </button>

              {/* WhatsApp */}
              <button 
                onClick={() => router.push('/whatsapp')}
                className="w-full flex items-center gap-4 p-4 lg:p-5 xl:p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 relative flex-shrink-0">
                    <Image
                      src="/assets/website_builder/whatsapp.png"
                      alt="WhatsApp"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-gray-900 font-medium lg:text-lg xl:text-xl">Whatsapp</span>
                </button>

              {/* Instagram */}
              <button 
                onClick={() => router.push('/instagram')}
                className="w-full flex items-center gap-4 p-4 lg:p-5 xl:p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 relative flex-shrink-0">
                    <Image
                      src="/assets/website_builder/insta.png"
                      alt="Instagram"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-gray-900 font-medium lg:text-lg xl:text-xl">Instagram</span>
                </button>

              {/* X (Twitter) */}
              <button 
                onClick={() => router.push('/x')}
                className="w-full flex items-center gap-4 p-4 lg:p-5 xl:p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 relative flex-shrink-0">
                    <Image
                      src="/assets/website_builder/X.png"
                      alt="X (Twitter)"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-gray-900 font-medium lg:text-lg xl:text-xl">X</span>
                </button>

              {/* LinkedIn */}
              <button 
                onClick={() => router.push('/linkedin')}
                className="w-full flex items-center gap-4 p-4 lg:p-5 xl:p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 relative flex-shrink-0">
                    <Image
                      src="/assets/website_builder/linkedin.png"
                      alt="LinkedIn"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-gray-900 font-medium lg:text-lg xl:text-xl">LinkedIn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:relative lg:border-t-0 lg:bg-transparent lg:mt-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl px-4 lg:px-0">
          <div className="flex justify-between items-center py-2 lg:py-4 lg:border-t lg:border-gray-200">
            <button className="flex flex-col items-center py-2 px-3 text-blue-600 lg:flex-row lg:gap-2">
              <svg className="w-6 h-6 mb-1 lg:mb-0 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium lg:text-sm">Home</span>
            </button>
            
            <button className="flex flex-col items-center py-2 px-3 text-gray-400 lg:flex-row lg:gap-2 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6 mb-1 lg:mb-0 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs lg:text-sm">Marketing</span>
            </button>
            
            <button className="flex flex-col items-center py-2 px-3 text-gray-400 lg:flex-row lg:gap-2 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6 mb-1 lg:mb-0 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs lg:text-sm">CRM</span>
            </button>
            
            <button className="flex flex-col items-center py-2 px-3 text-gray-400 lg:flex-row lg:gap-2 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6 mb-1 lg:mb-0 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs lg:text-sm">Engagement</span>
            </button>
            
            <button className="flex flex-col items-center py-2 px-3 text-gray-400 lg:flex-row lg:gap-2 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6 mb-1 lg:mb-0 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span className="text-xs lg:text-sm">Referrals</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
