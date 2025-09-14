"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeneratedContent {
  caption?: string;
  hashtags?: string[];
  character_count?: number;
  post_ideas?: string[];
  has_image?: boolean;
}

export default function Instagram() {
  const router = useRouter();
  const [action, setAction] = useState("caption");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Separate state for each content type
  const [formData, setFormData] = useState({
    caption: {
      context: "",
      selectedImage: null as File | null,
      imagePreview: ""
    },
    post_ideas: {
      topic: ""
    }
  });

  // Current form data based on selected action
  const context = formData.caption.context;
  const setContext = (value: string) => {
    setFormData(prev => ({
      ...prev,
      caption: { ...prev.caption, context: value }
    }));
  };

  const topic = formData.post_ideas.topic;
  const setTopic = (value: string) => {
    setFormData(prev => ({
      ...prev,
      post_ideas: { ...prev.post_ideas, topic: value }
    }));
  };

  const selectedImage = formData.caption.selectedImage;
  const imagePreview = formData.caption.imagePreview;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          caption: { 
            ...prev.caption, 
            selectedImage: file,
            imagePreview: preview
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      caption: { 
        ...prev.caption, 
        selectedImage: null,
        imagePreview: ""
      }
    }));
  };

  const handleGenerate = async () => {
    if (action === "post_ideas" && !topic.trim()) {
      setError("Please enter a topic for post ideas");
      return;
    }
    
    if (action === "caption" && !selectedImage && !context.trim()) {
      setError("Please upload an image or provide context for caption generation");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("action", action);
      
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      
      if (context.trim()) {
        formData.append("context", context);
      }
      
      if (topic.trim()) {
        formData.append("topic", topic);
      }

      const response = await fetch("/api/instagram-content", {
        method: "POST",
        body: formData,
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
              <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                <Image
                  src="/assets/website_builder/insta.png"
                  alt="Instagram"
                  width={40}
                  height={40}
                  className="w-15 h-10"
                />
              </div>
              <h1 className="text-lg font-medium text-gray-900 lg:text-xl xl:text-2xl">
                Instagram Content
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 pb-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <div className="space-y-6">

            {/* Action Type Selection - Rainbow Effect */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAction("caption")}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    action === "caption" 
                      ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg transform scale-105" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:via-pink-100 hover:to-red-100"
                  }`}
                >
                  Caption Generator
                </button>
                <button
                  onClick={() => setAction("post_ideas")}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    action === "post_ideas" 
                      ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg transform scale-105" 
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:via-pink-100 hover:to-red-100"
                  }`}
                >
                  Post Ideas
                </button>
              </div>
            </div>

            {/* Caption Generator Section */}
            {action === "caption" && (
              <>
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Upload Image (Optional)
                  </label>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 16MB</p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Context Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Context/Theme {!selectedImage && "*"}
                  </label>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <textarea
                      placeholder="Describe the theme or context for your post (e.g., family protection, financial security, insurance benefits)"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm lg:text-base resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Post Ideas Section */}
            {action === "post_ideas" && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Topic for Post Ideas *
                </label>
                <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                  <textarea
                    placeholder="Enter a topic for post ideas (e.g., term insurance benefits, family financial planning, insurance myths)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm lg:text-base resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Generated Content */}
            {generatedContent && (
              <div className="space-y-4">
                {generatedContent.caption && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">
                        Instagram Caption ({generatedContent.character_count} chars)
                      </h3>
                      <button
                        onClick={() => handleCopy(generatedContent.caption!)}
                        className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                      {generatedContent.caption}
                    </div>
                    {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Hashtags: </span>
                        <span className="text-xs text-blue-600">{generatedContent.hashtags.join(' ')}</span>
                      </div>
                    )}
                  </div>
                )}

                {generatedContent.post_ideas && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Post Ideas ({generatedContent.post_ideas.length} ideas)
                    </h3>
                    <div className="space-y-3">
                      {generatedContent.post_ideas.map((idea, index) => (
                        <div key={index} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg border">
                          <div className="flex-1">
                            <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>
                            <p className="text-gray-700 text-sm mt-1">{idea}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(idea)}
                            className="text-pink-600 hover:text-pink-700 text-xs font-medium ml-2"
                          >
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom CTA - Rainbow Effect */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-medium py-4 rounded-xl text-lg hover:from-purple-600 hover:via-pink-600 hover:to-red-600 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading ? "Generating Content..." : `Generate ${action === "caption" ? "Caption" : "Post Ideas"}`}
          </button>
        </div>
      </div>

    </div>
  );
}