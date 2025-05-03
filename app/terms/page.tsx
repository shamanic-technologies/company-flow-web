import React from 'react';
import { NavigationBar } from '@/components/landing/NavigationBar';
import { Footer } from '@/components/landing/Footer';

/**
 * Terms of Service Page Component
 * Displays the terms of service information.
 */
export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <NavigationBar />
      <main className="flex-grow">
        <div className="text-gray-100 py-12 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
            <div className="prose prose-invert max-w-none bg-gray-800 p-6 rounded-lg shadow-md">
              <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

              <p>
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Agent Base website and services (the "Service") operated by Blooming Generation SASU (operating as Agent Base, "us", "we", or "our").
              </p>

              <p>
                Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                These Terms apply to all visitors, users, and others who access or use the Service.
                By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
              </p>

              <h2 className="text-white">Accounts</h2>
              <p>
                When you create an account with us, you must provide us information that is accurate, complete, and current at all times.
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password,
                whether your password is with our Service or a third-party service.
              </p>

              <h2 className="text-white">Intellectual Property</h2>
              <p>
                The Service and its original content, features and functionality are and will remain the exclusive property of Blooming Generation SASU (Agent Base) and its licensors.
                Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Blooming Generation SASU.
              </p>

              <h2 className="text-white">Termination</h2>
              <p>
                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever,
                including without limitation if you breach the Terms.
                All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation,
                ownership provisions, warranty disclaimers, indemnity and limitations of liability.
              </p>

              <h2 className="text-white">Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of France, without regard to its conflict of law provisions.
              </p>

              <h2 className="text-white">Changes</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
                What constitutes a material change will be determined at our sole discretion.
              </p>

              <h2 className="text-white">Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us through our contact form.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 