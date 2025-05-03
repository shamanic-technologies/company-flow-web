import React from 'react';
// Import icon components
import {
  GmailIcon,
  GoogleIcon,
  WhatsAppIcon,
  ChromeIcon,
  GoogleDriveIcon,
} from "@/components/icons";

/**
 * Hero component
 * Displays the main headline and subtitle for the landing page
 */
export function Hero() {
  return (
    <div className="flex flex-col items-center text-center mb-4 relative">
      <h1 
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center mx-auto mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 animate-gradient-x leading-relaxed py-2" 
        style={{ textShadow: "0 0 40px rgba(56, 189, 248, 0.2)" }}
      >
        Run your business with AI
      </h1>
      
      <p 
        className="text-sm md:text-base font-normal text-center mx-auto max-w-3xl whitespace-nowrap mb-2"
        style={{ letterSpacing: "0.01em" }}
      >
        Build custom workflows with your favorite business tools
      </p>

      {/* Integration Logos with grey filter */}
      <div className="flex justify-center gap-6 mb-2">
        <div className="h-8 w-8 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-inner transition-transform hover:scale-110">
          <GmailIcon className="h-6 w-6 filter grayscale hover:grayscale-0 transition-all" />
        </div>
        <div className="h-8 w-8 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-inner transition-transform hover:scale-110">
          <GoogleIcon className="h-6 w-6 filter grayscale hover:grayscale-0 transition-all" />
        </div>
        <div className="h-8 w-8 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-inner transition-transform hover:scale-110">
          <GoogleIcon className="h-6 w-6 filter grayscale hover:grayscale-0 transition-all" />
        </div>
        <div className="h-8 w-8 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-inner transition-transform hover:scale-110">
          <WhatsAppIcon className="h-6 w-6 filter grayscale hover:grayscale-0 transition-all" />
        </div>
        <div className="h-8 w-8 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-inner transition-transform hover:scale-110">
          <ChromeIcon className="h-6 w-6 filter grayscale hover:grayscale-0 transition-all" />
        </div>
        <div className="h-8 w-8 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-inner transition-transform hover:scale-110">
          <GoogleDriveIcon className="h-6 w-6 filter grayscale hover:grayscale-0 transition-all" />
        </div>
      </div>
    </div>
  );
} 