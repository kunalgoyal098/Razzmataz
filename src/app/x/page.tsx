"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeneratedContent {
  content?: string | string[];
  hashtags?: string[];
  character_count?: number;
  total_characters?: number;
  thread_length?: number;
  is_thread?: boolean;
  is_reply?: boolean;
  tweet_type?: string;
  reply_type?: string;
}

export default function XPage() {
  const router = useRouter();
  const [contentType, setContentType] = useState("tweet");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Separate state for each content type
  const [formData, setFormData] = useState({
    tweet: {
      topic: "",
      tweetType: "general"
    },
    thread: {
      topic: "",
      threadLength: 3
    },
    reply: {
      topic: "",
      originalTweet: "",
      replyType: "helpful"
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

  const tweetType = contentType === "tweet" ? (formData.tweet as any).tweetType : "general";
  const setTweetType = (value: string) => {
    if (contentType === "tweet") {
      setFormData(prev => ({
        ...prev,
        tweet: { ...prev.tweet, tweetType: value }
      }));
    }
  };

  const threadLength = contentType === "thread" ? (formData.thread as any).threadLength : 3;
  const setThreadLength = (value: number) => {
    if (contentType === "thread") {
      setFormData(prev => ({
        ...prev,
        thread: { ...prev.thread, threadLength: value }
      }));
    }
  };

  const originalTweet = contentType === "reply" ? (formData.reply as any).originalTweet : "";
  const setOriginalTweet = (value: string) => {
    if (contentType === "reply") {
      setFormData(prev => ({
        ...prev,
        reply: { ...prev.reply, originalTweet: value }
      }));
    }
  };

  const replyType = contentType === "reply" ? (formData.reply as any).replyType : "helpful";
  const setReplyType = (value: string) => {
    if (contentType === "reply") {
      setFormData(prev => ({
        ...prev,
        reply: { ...prev.reply, replyType: value }
      }));
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or description");
      return;
    }

    if (contentType === "reply" && !originalTweet.trim()) {
      setError("Please enter the original tweet for reply generation");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/x-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          content_type: contentType,
          tweet_type: tweetType,
          thread_length: threadLength,
          original_tweet: originalTweet,
          reply_type: replyType,
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
              <div className="w-10 h-8rounded-lg flex items-center justify-center">
                <Image
                  src="/assets/website_builder/X.png"
                  alt="X"
                  width={25}
                  height={20}
                  className="w-25 h-10"
                />
              </div>
              <h1 className="text-lg font-medium text-gray-900 lg:text-xl xl:text-2xl">
                X Content
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
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setContentType("tweet")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "tweet" 
                      ? "bg-black text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Tweet
                </button>
                <button
                  onClick={() => setContentType("thread")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "thread" 
                      ? "bg-black text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Thread
                </button>
                <button
                  onClick={() => setContentType("reply")}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    contentType === "reply" 
                      ? "bg-black text-white" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Reply
                </button>
              </div>
            </div>

            {/* Tweet Type Selection (only for tweets) */}
            {contentType === "tweet" && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tweet Type
                </label>
                <select
                  value={tweetType}
                  onChange={(e) => setTweetType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-black text-gray-900 bg-white"
                >
                  <option value="general">General</option>
                  <option value="tip">Insurance Tip</option>
                  <option value="quote">Inspirational Quote</option>
                  <option value="fact">Industry Fact</option>
                  <option value="promotional">Promotional</option>
                  <option value="question">Question</option>
                  <option value="thread_starter">Thread Starter</option>
                </select>
              </div>
            )}

            {/* Thread Length (only for threads) */}
            {contentType === "thread" && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Thread Length
                </label>
                <select
                  value={threadLength}
                  onChange={(e) => setThreadLength(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-black text-gray-900 bg-white"
                >
                  <option value={3}>3 tweets</option>
                  <option value={4}>4 tweets</option>
                  <option value={5}>5 tweets</option>
                  <option value={6}>6 tweets</option>
                </select>
              </div>
            )}

            {/* Original Tweet (only for replies) */}
            {contentType === "reply" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Original Tweet *
                  </label>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <textarea
                      placeholder="Paste the original tweet you want to reply to"
                      value={originalTweet}
                      onChange={(e) => setOriginalTweet(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm lg:text-base resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Reply Type
                  </label>
                  <select
                    value={replyType}
                    onChange={(e) => setReplyType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-black text-gray-900 bg-white"
                  >
                    <option value="helpful">Helpful</option>
                    <option value="supportive">Supportive</option>
                    <option value="educational">Educational</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </div>
              </>
            )}

            {/* Topic/Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {contentType === "reply" ? "Your Expertise/Context" : "Topic/Description"} *
              </label>
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                <textarea
                  placeholder={
                    contentType === "reply" 
                      ? "Describe your insurance expertise or context for the reply"
                      : "Describe what you want to tweet about (e.g., importance of emergency funds, insurance myths)"
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
                {generatedContent.is_thread && Array.isArray(generatedContent.content) ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">
                        Twitter Thread ({generatedContent.thread_length} tweets, {generatedContent.total_characters} chars)
                      </h3>
                      <button
                        onClick={() => handleCopy(generatedContent.content!.join('\n\n'))}
                        className="text-black hover:text-gray-700 text-sm font-medium"
                      >
                        Copy All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {generatedContent.content.map((tweet, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-gray-500 font-medium">Tweet {index + 1}/{generatedContent.thread_length}</span>
                            <button
                              onClick={() => handleCopy(tweet)}
                              className="text-black hover:text-gray-700 text-xs font-medium"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-gray-700 text-sm">{tweet}</p>
                          <p className="text-xs text-gray-400 mt-1">{tweet.length}/280 chars</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">
                        {contentType === "reply" ? "Reply" : "Tweet"} ({generatedContent.character_count} chars)
                      </h3>
                      <button
                        onClick={() => handleCopy(generatedContent.content as string)}
                        className="text-black hover:text-gray-700 text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                      {generatedContent.content}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {generatedContent.character_count}/280 characters
                    </div>
                    {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Hashtags: </span>
                        <span className="text-xs text-blue-600">{generatedContent.hashtags.join(' ')}</span>
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
            disabled={isLoading || !topic.trim() || (contentType === "reply" && !originalTweet.trim())}
            className="w-full bg-black text-white font-medium py-4 rounded-xl text-lg hover:bg-gray-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating Content..." : `Generate ${contentType === "tweet" ? "Tweet" : contentType === "thread" ? "Thread" : "Reply"}`}
          </button>
        </div>
      </div>

    </div>
  );
}