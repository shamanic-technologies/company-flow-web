'use client';

import Link from 'next/link';

/**
 * Footer component for the application.
 * Displays copyright information, links, and social media icons.
 */
export const Footer = () => {
  // Function to handle opening the contact dialog
  const handleOpenContactDialog = (buttonId: string) => {
    const event = new CustomEvent('openSignInDialog', { detail: { buttonId } });
    window.dispatchEvent(event);
  };

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Agent Base</h3>
            <p className="text-sm text-gray-400 mb-4">Building the future of AI agent infrastructure.</p>
            <div className="flex space-x-4">
              <a href="https://github.com/agent-base-ai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/api-tool-store" className="text-gray-400 hover:text-white">API tools</Link></li>
              <li><Link href="/webhook-store" className="text-gray-400 hover:text-white">Webhook tools</Link></li>
              <li><Link href="/agent-tools" className="text-gray-400 hover:text-white">Agent tools</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleOpenContactDialog('footer-api-ref'); }} className="text-gray-400 hover:text-white">API Reference</a></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link href="/brand" className="text-gray-400 hover:text-white">Brand</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms</Link></li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleOpenContactDialog('footer_contact'); }} 
                  className="text-gray-400 hover:text-white"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© {new Date().getFullYear()} Agent Base. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <p className="text-sm">Made with ❤️ for developers</p>
          </div>
        </div>
      </div>
    </footer>
  );
}; 