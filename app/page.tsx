'use client';

import { useState, useEffect } from 'react';
import { NavigationBar } from '../components/landing/NavigationBar';
import { HeroSection } from '../components/landing/HeroSection';
import { CallToActionSection } from '../components/landing/CallToActionSection';
import { Footer } from '../components/landing/Footer';
import { ApiToolStoreSection } from '@/components/landing/sections/ApiToolStoreSection';
import { WebhookStoreSection } from '@/components/landing/sections/WebhookStoreSection';
import { AgentToolsSection } from '@/components/landing/sections/AgentToolsSection';
import { OpenSourceSection } from '@/components/landing/sections/OpenSourceSection';
import { SdkSection } from '@/components/landing/sections/SdkSection';
import { PricingSection } from '@/components/landing/sections/PricingSection';

/**
 * Landing Page Component
 * Orchestrates the display of various landing page sections.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      {/* Top navigation bar */}
      <NavigationBar />
      
      {/* Main hero section introducing the product */}
      <HeroSection />

      {/* Section showcasing the API Tool Store */}
      <ApiToolStoreSection />

      {/* Section showcasing the Webhook Store */}
      <WebhookStoreSection />

      {/* Section detailing the available agent tools */}
      <AgentToolsSection />

      {/* Section highlighting the open-source nature */}
      <OpenSourceSection />

      {/* Section describing the SDK */}
      <SdkSection />

      {/* Section displaying pricing information */}
      <PricingSection />

      {/* Final call to action section */}
      <CallToActionSection />

      {/* Footer section */}
      <Footer />
    </div>
  );
} 