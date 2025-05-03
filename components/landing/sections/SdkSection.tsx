'use client';

import { motion } from 'framer-motion';
import { Code } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { CopyCommand } from '@/components/ui/copy-command';

/**
 * SdkSection Component
 * Displays the SDK integration section of the landing page,
 * including a command example with copy functionality and a link to NPM.
 */
export function SdkSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-900/95 to-gray-900/90 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm bg-blue-950 text-blue-300 border border-blue-800 mb-6"
            >
              <Code className="h-4 w-4 mr-2"/> Developer First
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-100 mb-4"
            >
              Integrate With Our SDK
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-gray-400 mb-6"
            >
              Our JavaScript/TypeScript SDK makes it easy to integrate Agent Base into your applications.
              With just a few lines of code, you can access all our API endpoints.
            </motion.p>

            {/* Command with copy button */}
            <CopyCommand
              command="npm install @agent-base/api-client"
              className="mb-6"
            />

            {/* Make NPM button secondary */}
            <ButtonLink
              href="https://www.npmjs.com/package/@agent-base/api-client" // Replace with actual NPM package URL if different
              external
              color="secondary"
            >
              View on NPM
            </ButtonLink>
          </div>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-gray-950 p-6 rounded-lg border border-gray-800"
          >
            <div className="text-sm text-gray-300 font-mono">
              <div className="text-blue-400 mb-2">// Initialize the client</div>
              <div className="mb-4">
                const client = new AgentBaseClient(&#123;<br />
                &nbsp;&nbsp;apiKey: "your_api_key"<br />
                &#125;);
              </div>
              <div className="text-blue-400 mb-2">// Call any API tool from the internet with a prompt</div>
              <div>
                const tool = await client.agent.run(&#123;<br />
                &nbsp;&nbsp;prompt: "What is the weather in San Francisco?",<br />
                &#125;);
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 