"use client";

// import Image from "next/image"; // Unused import
import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeneratedContent {
  broadcast_message?: {
    text: string;
    word_count: number;
  };
  status_message?: {
    text: string;
    character_count: number;
    hashtags: string[];
  };
  extracted_info?: Record<string, unknown>;
}

export default function WhatsApp() {
  const router = useRouter();
  const [contentType, setContentType] = useState("both");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Separate state for each content type
  const [formData, setFormData] = useState({
    both: {
      policyDescription: ""
    },
    broadcast: {
      policyDescription: ""
    },
    status: {
      policyDescription: ""
    }
  });

  // Current form data based on selected content type
  const policyDescription = formData[contentType as keyof typeof formData].policyDescription;
  const setPolicyDescription = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [contentType]: { ...prev[contentType as keyof typeof prev], policyDescription: value }
    }));
  };

  const handleGenerate = async () => {
    if (!policyDescription.trim()) {
      setError("Please enter a policy description");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/whatsapp-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_prompt: policyDescription,
          content_type: contentType,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setGeneratedContent(data.data);
      } else {
        setError(data.message || "Failed to generate content");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="px-4 py-6 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-medium text-gray-900 lg:text-xl xl:text-2xl">
              WhatsApp Content Generator
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 pb-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <div className="space-y-6">
            
            {/* Policy Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Insurance Policy Description *
              </label>
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                <textarea
                  placeholder="Describe your insurance policy (e.g., Term insurance for IT professionals, 1 crore coverage at 1000/month with tax benefits and fast claims processing)"
                  value={policyDescription}
                  onChange={(e) => setPolicyDescription(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm lg:text-base resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setContentType("both")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "both" 
                      ? "bg-green-500 text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Both
                </button>
                <button
                  onClick={() => setContentType("broadcast")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "broadcast" 
                      ? "bg-green-500 text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Broadcast
                </button>
                <button
                  onClick={() => setContentType("status")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "status" 
                      ? "bg-green-500 text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Status
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Generated Content */}
            {generatedContent && (
              <div className="space-y-4">
                {generatedContent.broadcast_message && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">
                        Broadcast Message ({generatedContent.broadcast_message.word_count} words)
                      </h3>
                      <button
                        onClick={() => handleCopy(generatedContent.broadcast_message!.text)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-gray-700 text-base whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                      {generatedContent.broadcast_message.text}
                    </div>
                  </div>
                )}

                {generatedContent.status_message && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">
                        Status Message ({generatedContent.status_message.character_count} chars)
                      </h3>
                      <button
                        onClick={() => handleCopy(generatedContent.status_message!.text)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-gray-700 text-base whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                      {generatedContent.status_message.text}
                    </div>
                    {generatedContent.status_message.hashtags.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Hashtags: </span>
                        <span className="text-xs text-blue-600">{generatedContent.status_message.hashtags.join(' ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !policyDescription.trim()}
            className="w-full bg-green-500 text-white font-medium py-4 rounded-xl text-lg hover:bg-green-600 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating Content..." : "Generate WhatsApp Content"}
          </button>
        </div>
      </div>

    </div>
  );
}