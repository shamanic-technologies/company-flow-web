'use client';

import { useState } from 'react';
import { NavigationBar } from '@/components/landing/NavigationBar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

/**
 * Brand Assets Page
 * Provides downloadable brand assets including logos in different formats
 */
export default function BrandPage() {
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('dark');
  
  // Function to download SVG as an image file
  const downloadLogo = (svgId: string, fileName: string) => {
    const svgElement = document.getElementById(svgId);
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // If context is null, we can't proceed
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }
    
    // Create an image to draw to canvas
    const img = new Image();
    
    // Set up image load handler
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw white background for PNG output (only for light mode)
      if (activeTab === 'light') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Create download link
      const a = document.createElement('a');
      a.download = fileName;
      a.href = canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    
    // Load the image from SVG
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <NavigationBar />
      
      <main className="pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Brand Assets</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Download official Agent Base logos for your integrations and promotional materials.
            </p>
          </div>
          
          {/* Color mode selector */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-md border border-gray-800 p-1">
              <button
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'dark' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('dark')}
              >
                Dark Mode
              </button>
              <button
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'light' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('light')}
              >
                Light Mode
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            {/* Square Logo */}
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Square Logo</h2>
              <div className={`flex justify-center items-center p-8 ${activeTab === 'light' ? 'bg-white rounded-md' : ''}`}>
                <svg 
                  id="squareLogo" 
                  width="200" 
                  height="200" 
                  viewBox="0 0 200 200" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Square Logo */}
                  <rect width="200" height="200" rx="16" fill={activeTab === 'dark' ? '#111827' : '#FFFFFF'} fillOpacity={activeTab === 'dark' ? '1' : '0'} />
                  
                  {/* Diamond */}
                  <path d="M100 40L160 100L100 160L40 100L100 40Z" fill={activeTab === 'dark' ? '#2563EB' : '#2563EB'} />
                  
                  {/* Inner Diamond */}
                  <path d="M100 65L135 100L100 135L65 100L100 65Z" fill={activeTab === 'dark' ? '#1E40AF' : '#1E40AF'} />
                  
                  {/* Center Circle */}
                  <circle cx="100" cy="100" r="20" fill={activeTab === 'dark' ? '#60A5FA' : '#60A5FA'} />
                </svg>
              </div>
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => downloadLogo('squareLogo', `agent-base-square-logo-${activeTab}.png`)}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PNG
                </Button>
              </div>
            </div>
            
            {/* Landscape Logo */}
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Landscape Logo</h2>
              <div className={`flex justify-center items-center p-8 ${activeTab === 'light' ? 'bg-white rounded-md' : ''}`}>
                <svg 
                  id="landscapeLogo" 
                  width="300" 
                  height="120" 
                  viewBox="0 0 300 120" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Landscape Logo */}
                  <rect width="300" height="120" rx="8" fill={activeTab === 'dark' ? '#111827' : '#FFFFFF'} fillOpacity={activeTab === 'dark' ? '1' : '0'} />
                  
                  {/* Diamond Logo Element */}
                  <g transform="translate(30, 20) scale(0.67)">
                    {/* Diamond */}
                    <path d="M60 20L100 60L60 100L20 60L60 20Z" fill={activeTab === 'dark' ? '#2563EB' : '#2563EB'} />
                    
                    {/* Inner Diamond */}
                    <path d="M60 35L85 60L60 85L35 60L60 35Z" fill={activeTab === 'dark' ? '#1E40AF' : '#1E40AF'} />
                    
                    {/* Center Circle */}
                    <circle cx="60" cy="60" r="13" fill={activeTab === 'dark' ? '#60A5FA' : '#60A5FA'} />
                  </g>
                  
                  {/* Text */}
                  <text x="120" y="68" fontFamily="Arial" fontSize="32" fontWeight="bold" fill={activeTab === 'dark' ? '#FFFFFF' : '#111827'}>
                    Agent Base
                  </text>
                </svg>
              </div>
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => downloadLogo('landscapeLogo', `agent-base-landscape-logo-${activeTab}.png`)}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PNG
                </Button>
              </div>
            </div>
          </div>
          
          {/* Usage Guidelines */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Usage Guidelines</h2>
            <div className="text-gray-400 space-y-4">
              <p>When using the Agent Base logo, please follow these guidelines:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Maintain clear space around the logo equal to at least half the width of the diamond</li>
                <li>Do not stretch, distort, or alter the colors of the logo</li>
                <li>Do not place the logo on busy backgrounds that reduce legibility</li>
                <li>Use the dark version on light backgrounds and light version on dark backgrounds</li>
                <li>The primary brand colors are blue (#2563EB) and light blue (#60A5FA)</li>
                <li>For questions about usage, please <a href="#" className="text-blue-400 hover:underline">contact us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 