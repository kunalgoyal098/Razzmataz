"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeneratedContent {
  content?: string;
  hashtags?: string[];
  character_count?: number;
  word_count?: number;
  sections?: number;
  post_type?: string;
  comment_type?: string;
  is_comment?: boolean;
  is_connection_request?: boolean;
  original_post?: string;
  recipient_profile?: string;
}

export default function LinkedIn() {
  const router = useRouter();
  const [contentType, setContentType] = useState("post");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Separate state for each content type
  const [formData, setFormData] = useState({
    post: {
      topic: "",
      postType: "thought_leadership"
    },
    article: {
      topic: ""
    },
    comment: {
      topic: "",
      originalPost: "",
      commentType: "expert_insight"
    },
    connection: {
      topic: "",
      recipientProfile: ""
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

  const postType = contentType === "post" ? (formData.post as any).postType : "thought_leadership";
  const setPostType = (value: string) => {
    if (contentType === "post") {
      setFormData(prev => ({
        ...prev,
        post: { ...prev.post, postType: value }
      }));
    }
  };

  const originalPost = contentType === "comment" ? (formData.comment as any).originalPost : "";
  const setOriginalPost = (value: string) => {
    if (contentType === "comment") {
      setFormData(prev => ({
        ...prev,
        comment: { ...prev.comment, originalPost: value }
      }));
    }
  };

  const commentType = contentType === "comment" ? (formData.comment as any).commentType : "expert_insight";
  const setCommentType = (value: string) => {
    if (contentType === "comment") {
      setFormData(prev => ({
        ...prev,
        comment: { ...prev.comment, commentType: value }
      }));
    }
  };

  const recipientProfile = contentType === "connection" ? (formData.connection as any).recipientProfile : "";
  const setRecipientProfile = (value: string) => {
    if (contentType === "connection") {
      setFormData(prev => ({
        ...prev,
        connection: { ...prev.connection, recipientProfile: value }
      }));
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or description");
      return;
    }

    if (contentType === "comment" && !originalPost.trim()) {
      setError("Please enter the original post for comment generation");
      return;
    }

    if (contentType === "connection" && !recipientProfile.trim()) {
      setError("Please enter the recipient profile information");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/linkedin-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          content_type: contentType,
          post_type: postType,
          original_post: originalPost,
          comment_type: commentType,
          recipient_profile: recipientProfile,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setGeneratedContent(data.data);
      } else {
        setError(data.message || "Failed to generate content");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optional: Show a brief success message
      console.log('Content copied to clipboard');
    } catch (err) {
      // Fallback for mobile or when clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('Content copied to clipboard (fallback)');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
      document.body.removeChild(textArea);
    }
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
              <div className="w-15 h-10 rounded-lg flex items-center justify-center">
                <Image
                  src="/assets/website_builder/linkedin.png"
                  alt="LinkedIn"
                  width={20}
                  height={20}
                  className="w-20 h-15"
                />
              </div>
              <h1 className="text-lg font-medium text-gray-900 lg:text-xl xl:text-2xl">
                LinkedIn Content
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 pb-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <div className="space-y-6">
            

            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setContentType("post")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "post" 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Post
                </button>
                <button
                  onClick={() => setContentType("article")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "article" 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Article Outline
                </button>
                <button
                  onClick={() => setContentType("comment")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "comment" 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Comment
                </button>
                <button
                  onClick={() => setContentType("connection")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "connection" 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Connection
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-900 bg-white"
                >
                  <option value="thought_leadership">Thought Leadership</option>
                  <option value="client_success">Client Success Story</option>
                  <option value="insurance_education">Insurance Education</option>
                  <option value="industry_insights">Industry Insights</option>
                  <option value="business_growth">Business Growth Tips</option>
                  <option value="risk_management">Risk Management</option>
                  <option value="financial_planning">Financial Planning</option>
                  <option value="agent_journey">Agent Journey</option>
                  <option value="networking">Professional Networking</option>
                  <option value="compliance_updates">Compliance Updates</option>
                </select>
              </div>
            )}

            {/* Comment Type (only for comments) */}
            {contentType === "comment" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Original Post *
                  </label>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <textarea
                      placeholder="Paste the original LinkedIn post you want to comment on"
                      value={originalPost}
                      onChange={(e) => setOriginalPost(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm lg:text-base resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Comment Type
                  </label>
                  <select
                    value={commentType}
                    onChange={(e) => setCommentType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-900 bg-white"
                  >
                    <option value="expert_insight">Expert Insurance Insight</option>
                    <option value="supportive_advice">Supportive Advice</option>
                    <option value="educational_tip">Educational Tip</option>
                    <option value="risk_analysis">Risk Analysis</option>
                    <option value="industry_perspective">Industry Perspective</option>
                    <option value="solution_oriented">Solution Oriented</option>
                    <option value="networking_value">Networking Value Add</option>
                  </select>
                </div>
              </>
            )}

            {/* Recipient Profile (only for connections) */}
            {contentType === "connection" && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Recipient Profile *
                </label>
                <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                  <textarea
                    placeholder="Describe the person you want to connect with (e.g., Financial advisor at XYZ company, specializes in retirement planning)"
                    value={recipientProfile}
                    onChange={(e) => setRecipientProfile(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm lg:text-base resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Topic/Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {contentType === "comment" ? "Your Expertise/Perspective" : 
                 contentType === "connection" ? "Connection Context" : 
                 "Topic/Description"} *
              </label>
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                <textarea
                  placeholder={
                    contentType === "comment" ? "Your insurance expertise or perspective to add to the conversation" :
                    contentType === "connection" ? "Why you want to connect and what you can offer" :
                    contentType === "article" ? "Article topic (e.g., 5 insurance mistakes small business owners make)" :
                    "Describe what you want to post about (e.g., importance of business insurance for startups)"
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
                      {contentType === "post" ? `LinkedIn Post (${generatedContent.word_count} words)` :
                       contentType === "article" ? `Article Outline (${generatedContent.sections} sections)` :
                       contentType === "comment" ? `Comment (${generatedContent.word_count} words)` :
                       `Connection Message (${generatedContent.character_count} chars)`}
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
                  {contentType === "connection" && (
                    <div className="mt-2 text-xs text-gray-400">
                      {generatedContent.character_count}/300 characters (LinkedIn limit)
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
            disabled={isLoading || !topic.trim() || 
              (contentType === "comment" && !originalPost.trim()) ||
              (contentType === "connection" && !recipientProfile.trim())}
            className="w-full bg-blue-600 text-white font-medium py-4 rounded-xl text-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating Content..." : 
             `Generate ${contentType === "post" ? "Post" : 
                        contentType === "article" ? "Article Outline" : 
                        contentType === "comment" ? "Comment" : 
                        "Connection Message"}`}
          </button>
        </div>
      </div>

    </div>
  );
}