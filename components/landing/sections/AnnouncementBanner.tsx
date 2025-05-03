'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Dismissible Announcement Banner Component
 * Displays a site-wide announcement that can be dismissed by the user.
 * Dismissal state is persisted in localStorage.
 */
export const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check localStorage only on the client side
    if (localStorage.getItem('announcementBannerDismissed') !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal state in localStorage
    localStorage.setItem('announcementBannerDismissed', 'true');
  };

  // Function to handle opening the contact dialog
  const handleOpenContactDialog = (buttonId: string) => {
    const event = new CustomEvent('openSignInDialog', { detail: { buttonId } });
    window.dispatchEvent(event);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sticky top-0 w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white z-60">
      <div className="max-w-7xl mx-auto py-1 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex-1 text-center sm:text-left">
          <p className="font-medium">
            <span className="md:hidden">We're raising €5M Seed!</span>
            <span className="hidden md:inline">We're raising our €5M Seed round! 🎉</span>
            <span className="block sm:ml-2 sm:inline-block">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleOpenContactDialog('banner_contact_seed'); }} 
                className="font-bold underline hover:text-indigo-100 cursor-pointer"
              >
                Contact us for information &rarr;
              </a>
            </span>
          </p>
        </div>
        <div>
          <button
            type="button"
            className="flex p-1.5 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}; 