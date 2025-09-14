"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col font-sans">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          
          {/* Logo Section */}
          <div className="space-y-6">
            <div className="mx-auto w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 relative">
              <Image
                src="/assets/logos/razz.png"
                alt="Razzmatazz"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Razzmatazz</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-sm mx-auto">
                Boost your insurance business with AI
              </p>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In to Continue
            </button>
            
            <p className="text-sm text-gray-500">
              New to Razzmatazz?{' '}
              <button
                onClick={() => router.push('/auth/signup')}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}