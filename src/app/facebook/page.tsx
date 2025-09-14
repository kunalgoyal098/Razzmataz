"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeneratedContent {
  content?: string;
  hashtags?: string[];
  character_count?: number;
  word_count?: number;
  post_type?: string;
  content_type?: string;
}

export default function Facebook() {
  const router = useRouter();
  const [contentType, setContentType] = useState("post");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Separate state for each content type
  const [formData, setFormData] = useState({
    post: {
      topic: "",
      postType: "policy_awareness"
    },
    event: {
      topic: ""
    },
    ad: {
      topic: ""
    }
  });

  // Current form data based on selected content type
  const topic = formData[contentType as keyof typeof formData].topic;
  const setTopic = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [contentType]: { ...prev[contentType as keyof typeof prev], topic: value }
    }));
  };

  const postType = contentType === "post" ? (formData.post as { postType: string }).postType : "policy_awareness";
  const setPostType = (value: string) => {
    if (contentType === "post") {
      setFormData(prev => ({
        ...prev,
        post: { ...prev.post, postType: value }
      }));
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or description");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/facebook-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          content_type: contentType,
          post_type: postType,
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image
                  src="/assets/website_builder/facebook.png"
                  alt="Facebook"
                  width={20}
                  height={20}
                  className="w-15 h-10"
                />
              </div>
              <h1 className="text-lg font-medium text-gray-900 lg:text-xl xl:text-2xl">
                Facebook Content
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 pb-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <div className="space-y-6">
            

            {/* Content Type Selection - Rainbow Effect */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setContentType("post")}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    contentType === "post" 
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transform scale-105" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:via-purple-100 hover:to-pink-100"
                  }`}
                >
                  Post
                </button>
                <button
                  onClick={() => setContentType("event")}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    contentType === "event" 
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transform scale-105" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:via-purple-100 hover:to-pink-100"
                  }`}
                >
                  Event
                </button>
                <button
                  onClick={() => setContentType("ad")}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    contentType === "ad" 
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transform scale-105" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:via-purple-100 hover:to-pink-100"
                  }`}
                >
                  Ad Copy
                </button>
              </div>
            </div>

            {/* Post Type Selection (only for posts) */}
            {contentType === "post" && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Post Type
                </label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="policy_awareness">Policy Awareness</option>
                  <option value="client_success">Client Success Story</option>
                  <option value="insurance_tips">Insurance Tips & Education</option>
                  <option value="family_protection">Family Protection</option>
                  <option value="financial_planning">Financial Planning</option>
                  <option value="claim_assistance">Claim Assistance</option>
                  <option value="premium_benefits">Premium Benefits</option>
                  <option value="tax_savings">Tax Savings</option>
                  <option value="myth_busting">Insurance Myth Busting</option>
                  <option value="agent_introduction">Agent Introduction</option>
                </select>
              </div>
            )}

            {/* Topic/Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {contentType === "post" ? "Post Topic/Description" : 
                 contentType === "event" ? "Event Details" : 
                 "Product/Service Details"} *
              </label>
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                <textarea
                  placeholder={
                    contentType === "post" ? "Describe what you want to post about (e.g., importance of life insurance for young families)" :
                    contentType === "event" ? "Describe your event (e.g., Free insurance consultation seminar at community center)" :
                    "Describe your product/service (e.g., Term insurance with 1 crore coverage at affordable rates)"
                  }
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm lg:text-base resize-none"
                  rows={4}
                />
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
                <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">
                      {contentType === "post" ? `Facebook Post (${generatedContent.word_count} words)` :
                       contentType === "event" ? `Event Post (${generatedContent.word_count} words)` :
                       "Facebook Ad Copy"}
                    </h3>
                    <button
                      onClick={() => handleCopy(generatedContent.content!)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                    {generatedContent.content}
                  </div>
                  {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Hashtags: </span>
                      <span className="text-xs text-blue-600">{generatedContent.hashtags.join(' ')}</span>
                    </div>
                  )}
                  {generatedContent.post_type && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Type: </span>
                      <span className="text-xs text-gray-700 capitalize">{generatedContent.post_type}</span>
                    </div>
                  )}
                </div>
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
            disabled={isLoading || !topic.trim()}
            className="w-full bg-blue-500 text-white font-medium py-4 rounded-xl text-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating Content..." : `Generate ${contentType === "post" ? "Post" : contentType === "event" ? "Event Post" : "Ad Copy"}`}
          </button>
        </div>
      </div>

    </div>
  );
}