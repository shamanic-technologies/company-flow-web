'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { GitHubIconWhite } from '@/components/icons';

/**
 * OpenSourceSection Component
 * Displays the Open Source section of the landing page,
 * highlighting community benefits and linking to GitHub.
 */
export function OpenSourceSection() {
  const floatingIconAnimation = (duration: number, xRange: number[], yRange: number[], opacityRange: number[]) => ({
    x: xRange,
    y: yRange,
    opacity: opacityRange,
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut"
    }
  });

  return (
    <section className="py-16 bg-gradient-to-b from-gray-950 to-gray-900/95 overflow-hidden relative">
      {/* Abstract background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10 z-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
      </div>

      {/* Floating GitHub logos */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div
          initial={{ x: -20, y: 50, opacity: 0.3 }}
          animate={floatingIconAnimation(15, [-20, 10, -20], [50, 80, 50], [0.3, 0.5, 0.3])}
          className="absolute top-[15%] left-[10%]"
        >
          <GitHubIconWhite className="w-10 h-10 opacity-30" />
        </motion.div>
        <motion.div
          initial={{ x: 0, y: 0, opacity: 0.2 }}
          animate={floatingIconAnimation(10, [0, 15, 0], [0, -15, 0], [0.2, 0.4, 0.2])}
          className="absolute top-[25%] right-[15%]"
        >
          <GitHubIconWhite className="w-16 h-16 opacity-20" />
        </motion.div>
        <motion.div
          initial={{ x: 20, y: -10, opacity: 0.1 }}
          animate={floatingIconAnimation(12, [20, 0, 20], [-10, 10, -10], [0.1, 0.25, 0.1])}
          className="absolute bottom-[20%] left-[20%]"
        >
          <GitHubIconWhite className="w-12 h-12 opacity-25" />
        </motion.div>
        <motion.div
          initial={{ x: -5, y: -5, opacity: 0.15 }}
          animate={floatingIconAnimation(8, [-5, 10, -5], [-5, 5, -5], [0.15, 0.3, 0.15])}
          className="absolute bottom-[30%] right-[25%]"
        >
          <GitHubIconWhite className="w-8 h-8 opacity-30" />
        </motion.div>
        <motion.div
          initial={{ x: 0, y: 0, opacity: 0.05 }}
          animate={floatingIconAnimation(14, [0, -10, 0], [0, -10, 0], [0.05, 0.2, 0.05])}
          className="absolute top-[45%] left-[35%]"
        >
          <GitHubIconWhite className="w-20 h-20 opacity-15" />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm bg-indigo-950 text-indigo-300 border border-indigo-800 mb-6"
          >
            <Sparkles className="h-4 w-4 mr-2"/> Community Driven
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-100 mb-6"
          >
            We're <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 bg-clip-text text-transparent">Open Source</span>
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-8"
          >
            We believe in transparency and community-driven development. All our tools are open source and available on GitHub.
          </motion.p>

          {/* Open Source Benefits */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-10 grid md:grid-cols-3 gap-6 text-center max-w-5xl mx-auto"
          >
            <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-800/50">
              <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-900/30 border border-blue-700/50 mx-auto">
                <div className="text-xl">👁️</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Transparency</h3>
              <p className="text-gray-400 text-sm">See exactly how our tools work and contribute improvements</p>
            </div>
            <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-800/50">
              <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-900/30 border border-purple-700/50 mx-auto">
                <div className="text-xl">🤝</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Community</h3>
              <p className="text-gray-400 text-sm">Join a community of developers building the future of AI agents</p>
            </div>
            <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-800/50">
              <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-900/30 border border-green-700/50 mx-auto">
                <div className="text-xl">🔐</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Security</h3>
              <p className="text-gray-400 text-sm">Open source means better security through community review</p>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <ButtonLink
              href="https://github.com/agent-base-ai" // Replace with actual GitHub org URL
              external
              color="github"
              className="gap-2"
            >
              <GitHubIconWhite className="w-5 h-5" />
              Join Us on GitHub
              <ArrowRight className="ml-1 h-4 w-4" />
            </ButtonLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 