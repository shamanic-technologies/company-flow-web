import React from 'react';
import { NavigationBar } from '@/components/landing/NavigationBar'; // Corrected Navbar path
import { Footer } from '@/components/landing/Footer';

/**
 * About Page Component
 * Displays basic information about the company.
 */
export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <NavigationBar />
      <main className="flex-grow">
        <div className="text-gray-100 py-12 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-6">About Agent Base</h1>
            <div className="prose prose-invert max-w-none bg-gray-800 p-6 rounded-lg shadow-md">
              <p>
                Welcome to Agent Base, operated by Blooming Generation SASU! We are dedicated to building the open-source infrastructure
                needed for the next generation of AI agents.
              </p>
              <p>
                Our mission is to provide developers with robust, scalable, and easy-to-use tools
                to create, deploy, and manage sophisticated AI agents for various applications.
              </p>
              <h2 className="text-white">Our Vision</h2>
              <p>
                We envision a future where AI agents seamlessly integrate into workflows,
                automating tasks, providing insights, and enhancing productivity across all industries.
                We believe that open-source is the key to fostering innovation and collaboration in this rapidly evolving field.
              </p>
              <h2 className="text-white">Contact Us</h2>
              <p>
                If you have any questions or would like to learn more about Agent Base or Blooming Generation SASU, please feel free to reach out via our contact form.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 