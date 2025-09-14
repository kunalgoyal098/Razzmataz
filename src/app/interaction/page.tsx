"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CallAnalysis {
  context_used: string;
  full_analysis: string;
  processing_time: string;
}

export default function Interaction() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select an MP3, WAV, or M4A audio file.');
        return;
      }

      // Validate file size (max 25MB)
      const maxSize = 25 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size must be less than 25MB.');
        return;
      }

      setSelectedFile(file);
      setError("");
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an audio file first.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);

      const response = await fetch('/api/analyze-call', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        setAnalysis(result.data);
      } else {
        setError(result.message || 'Failed to analyze call recording');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatAnalysis = (text: string) => {
    // Split the analysis into sections for better readability
    const sections = text.split('**').filter(section => section.trim());
    
    return sections.map((section, index) => {
      if (section.includes(':') && !section.includes('\n')) {
        // This is likely a header
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-2">
            {section.replace(':', '')}
          </h3>
        );
      } else {
        // This is content
        return (
          <div key={index} className="mb-4">
            {section.split('\n').map((line, lineIndex) => {
              if (line.trim() === '') return null;
              
              if (line.startsWith('- ')) {
                return (
                  <li key={lineIndex} className="ml-4 text-gray-700 mb-1">
                    {line.substring(2)}
                  </li>
                );
              }
              
              return (
                <p key={lineIndex} className="text-gray-700 mb-2 leading-relaxed">
                  {line}
                </p>
              );
            })}
          </div>
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative">
                <Image
                  src="/assets/website_builder/microphone.png"
                  alt="Call Analysis"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Call Analysis</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Call Recording</h2>
          <p className="text-sm text-gray-600 mb-6">
            Upload your insurance sales call recording to get detailed analysis, insights, and coaching tips.
          </p>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Choose Different File
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      'Analyze Call'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Click to upload
                  </button>
                  <span className="text-gray-500"> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500">MP3, WAV, M4A up to 25MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Call Analysis Results</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {analysis.processing_time}
              </span>
            </div>

            <div className="prose max-w-none">
              {formatAnalysis(analysis.full_analysis)}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex space-x-4">
              <button
                onClick={() => {
                  const element = document.createElement('a');
                  const file = new Blob([analysis.full_analysis], { type: 'text/plain' });
                  element.href = URL.createObjectURL(file);
                  element.download = `call-analysis-${new Date().toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Download Report
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setAnalysis(null);
                  setError("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Analyze Another Call
              </button>
            </div>
          </div>
        )}

        {/* Features Info */}
        {!analysis && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What You'll Get</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Detailed Transcript</h4>
                  <p className="text-sm text-gray-600">Complete conversation breakdown with key moments identified</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Performance Analysis</h4>
                  <p className="text-sm text-gray-600">Agent strengths, weaknesses, and improvement opportunities</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Sentiment Analysis</h4>
                  <p className="text-sm text-gray-600">Client mood, engagement level, and emotional responses</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Coaching Tips</h4>
                  <p className="text-sm text-gray-600">Actionable recommendations to improve future calls</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
