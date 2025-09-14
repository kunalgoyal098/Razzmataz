"use client";

// import Image from "next/image"; // Unused import
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  agentName: string;
  businessName: string;
  address: string;
  contactNumber: string;
  email: string;
  logo: File | null;
  officePhotos: File[];
}

export default function WebsiteBuilder() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    agentName: "",
    businessName: "",
    address: "",
    contactNumber: "",
    email: "",
    logo: null,
    officePhotos: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWebsiteUrl, setGeneratedWebsiteUrl] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleOfficePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      officePhotos: [...prev.officePhotos, ...files]
    }));
  };

  const removeOfficePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      officePhotos: prev.officePhotos.filter((_, i) => i !== index)
    }));
  };

  const generateWebsite = async () => {
    setIsGenerating(true);
    
    try {
      // Create FormData to send files and data
      const formDataToSend = new FormData();
      formDataToSend.append('agentName', formData.agentName);
      formDataToSend.append('businessName', formData.businessName);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('email', formData.email);
      
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      
      formData.officePhotos.forEach((photo) => {
        formDataToSend.append('officePhotos', photo);
      });

      // Call API to generate website
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedWebsiteUrl(result.websiteUrl);
        
        // Debug: Log the generated files to console
        console.log('Generated website files:', result.generatedFiles);
        
        // If we have generated files, let's create a preview
        if (result.generatedFiles) {
          console.log('HTML Preview:', result.generatedFiles['index.html'].substring(0, 500));
          console.log('CSS Preview:', result.generatedFiles['style.css'].substring(0, 500));
          console.log('JS Preview:', result.generatedFiles['script.js'].substring(0, 500));
        }
      } else {
        throw new Error(result.error || 'Failed to generate website');
      }
      
    } catch (error) {
      console.error("Error generating website:", error);
      alert(`Error generating website: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = () => {
    return formData.agentName && 
           formData.businessName && 
           formData.address && 
           formData.contactNumber && 
           formData.email &&
           formData.logo;
  };

  if (generatedWebsiteUrl) {
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
                Website Generated Successfully!
              </h1>
            </div>
          </div>
        </header>

        {/* Success Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 pb-24 lg:pb-8">
          <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Website is Ready!</h2>
                <p className="text-gray-600">Your professional insurance website has been created and deployed.</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-3">Website URL:</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-blue-600 font-medium break-all">{generatedWebsiteUrl}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedWebsiteUrl)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.open(generatedWebsiteUrl, '_blank')}
                  className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  View Website
                </button>
                <button
                  onClick={() => {
                    setGeneratedWebsiteUrl("");
                    setFormData({
                      agentName: "",
                      businessName: "",
                      address: "",
                      contactNumber: "",
                      email: "",
                      logo: null,
                      officePhotos: []
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              Build Your Insurance Website
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 pb-24 lg:pb-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <div className="space-y-6">
            
            {/* Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Insurance Agent Details</h2>
              
              <div className="space-y-4">
                {/* Agent Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    name="agentName"
                    value={formData.agentName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter your business name"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none text-gray-900 bg-white"
                    placeholder="Enter your complete business address"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter your contact number"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Business Logo *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {formData.logo ? (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">{formData.logo.name}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload logo</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Office Photos Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Office Photos (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleOfficePhotosUpload}
                      className="hidden"
                      id="office-photos-upload"
                    />
                    <label
                      htmlFor="office-photos-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-sm text-gray-600">Click to upload office photos</p>
                    </label>
                  </div>
                  
                  {/* Display uploaded office photos */}
                  {formData.officePhotos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {formData.officePhotos.map((photo, index) => (
                        <div key={index} className="relative bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 truncate">{photo.name}</span>
                            <button
                              onClick={() => removeOfficePhoto(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-24 lg:pb-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
          <button
            onClick={generateWebsite}
            disabled={!isFormValid() || isGenerating}
            className={`w-full font-medium py-4 rounded-xl text-lg transition-all duration-200 ${
              isFormValid() && !isGenerating
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Generating Your Website...
              </div>
            ) : (
              'Generate My Insurance Website'
            )}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:relative lg:border-t-0 lg:bg-transparent lg:mt-8">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl px-4 lg:px-0">
          <div className="flex justify-between items-center py-2 lg:py-4 lg:border-t lg:border-gray-200">
            <button 
              onClick={() => router.push('/')}
              className="flex flex-col items-center py-2 px-3 text-blue-600 lg:flex-row lg:gap-2"
            >
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
