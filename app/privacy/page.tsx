import React from 'react';
import { NavigationBar } from '@/components/landing/NavigationBar';
import { Footer } from '@/components/landing/Footer';

/**
 * Privacy Policy Page Component
 * Displays the privacy policy information.
 */
export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <NavigationBar />
      <main className="flex-grow">
        <div className="text-gray-100 py-12 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
            <div className="prose prose-invert max-w-none bg-gray-800 p-6 rounded-lg shadow-md">
              <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
              
              <p>
                Blooming Generation SASU (operating as Agent Base, "us", "we", or "our") operates the Agent Base website and services (the "Service").
                This page informs you of our policies regarding the collection, use, and disclosure of personal data
                when you use our Service and the choices you have associated with that data.
              </p>

              <h2 className="text-white">Information Collection and Use</h2>
              <p>
                We collect several different types of information for various purposes to provide and improve our Service to you.
                This may include, but is not limited to, usage data, cookies, and personal information you provide voluntarily (e.g., through contact forms).
              </p>

              <h2 className="text-white">Use of Data</h2>
              <p>
                Blooming Generation SASU (Agent Base) uses the collected data for various purposes:
              </p>
              <ul>
                <li>To provide and maintain the Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide customer care and support</li>
                <li>To provide analysis or valuable information so that we can improve the Service</li>
                <li>To monitor the usage of the Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>

              <h2 className="text-white">Data Security</h2>
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet,
                or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect
                your Personal Data, we cannot guarantee its absolute security.
              </p>

              <h2 className="text-white">Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>

              <h2 className="text-white">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through our contact form.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 