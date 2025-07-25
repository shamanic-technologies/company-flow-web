/**
 * Animated Terminal Component
 * 
 * A terminal-like component that shows typing animation and 
 * displays tools with their logos on "execution" in an AI agent style
 */

import React, { useState, useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { 
  GitHubIcon, 
  PostgresIcon, 
  GmailIcon, 
  WhatsAppIcon, 
  GoogleDriveIcon, 
  GoogleCalendarIcon,
  GoogleDocsIcon,
  SupabaseIcon,
  StripeIcon,
  FacebookIcon
} from '../icons';

// Array of available tools with their names and icons
const TOOLS = [
  { name: 'postgres', icon: PostgresIcon },
  { name: 'github', icon: GitHubIcon },
  { name: 'gmail', icon: GmailIcon },
  { name: 'whatsapp', icon: WhatsAppIcon },
  { name: 'google-drive', icon: GoogleDriveIcon },
  { name: 'google-calendar', icon: GoogleCalendarIcon },
  { name: 'google-docs', icon: GoogleDocsIcon },
  { name: 'supabase', icon: SupabaseIcon },
  { name: 'stripe', icon: StripeIcon },
  { name: 'facebook', icon: FacebookIcon }
];

// Animation variants for tool items
const toolItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
};

// Loader animation component
const Loader = () => (
  <div className="flex space-x-1 mt-1 mb-2">
    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

// CheckMark component
const CheckMark = () => (
  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);

export const AnimatedTerminal = () => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [showTools, setShowTools] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [isToolsComplete, setIsToolsComplete] = useState(false);
  const [toolsCollapsed, setToolsCollapsed] = useState(false);
  const [showGmailInfo, setShowGmailInfo] = useState(false);
  const [gmailInfoExpanded, setGmailInfoExpanded] = useState(true);
  const [isGmailInfoComplete, setIsGmailInfoComplete] = useState(false);
  const [gmailInfoCollapsed, setGmailInfoCollapsed] = useState(false);
  const [showCallTool, setShowCallTool] = useState(false);
  const [typingTools, setTypingTools] = useState(true);
  const [typingGmail, setTypingGmail] = useState(true);

  // Start animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTools(true);
      
      // After tools are shown, trigger completion after a delay
      setTimeout(() => {
        setIsStreaming(false);
        setIsToolsComplete(true);
      }, 2000);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Timer to collapse tools list after display
  useEffect(() => {
    if (isToolsComplete && toolsExpanded) {
      const timer = setTimeout(() => {
        setToolsExpanded(false);
        
        // Wait a bit after collapsing before moving to next step
        setTimeout(() => {
          setToolsCollapsed(true);
        }, 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isToolsComplete, toolsExpanded]);

  // Timer to mark Gmail info complete and eventually collapse
  useEffect(() => {
    if (showGmailInfo) {
      const timer = setTimeout(() => {
        setIsGmailInfoComplete(true);
        
        // Auto-collapse after delay
        setTimeout(() => {
          setGmailInfoExpanded(false);
          
          // Wait a bit after collapsing before moving to next step
          setTimeout(() => {
            setGmailInfoCollapsed(true);
          }, 500);
        }, 2000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showGmailInfo]);

  return (
    <div className="relative bg-gray-900 p-5 rounded-lg shadow-xl border border-gray-800">
      <div className="flex items-center space-x-2 mb-3">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <div className="text-xs font-mono text-gray-400 ml-2">// Agent Base API Example</div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded text-sm font-mono overflow-x-auto text-gray-200">
        {/* User Prompt */}
        <div className="mb-4 border-l-4 border-green-500 pl-3 py-2 bg-green-900/20">
          <div className="text-green-300 font-semibold">User:</div>
          <div className="text-white">Send an email to John Doe</div>
        </div>
        
        {/* Command 1: List Tools */}
        <div className="mb-4">
          <div className="mt-2 pl-3">
            <div 
              className="flex items-center gap-2 text-blue-400 cursor-pointer hover:text-blue-300 mb-1"
              onClick={() => !isStreaming && setToolsExpanded(!toolsExpanded)}
            >
              <svg 
                className={`w-4 h-4 transform transition-transform ${toolsExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
              
              <TypeAnimation
                sequence={[
                  'List',
                  100,
                  'Listing',
                  100,
                  'Listing av',
                  100,
                  'Listing avai',
                  100,
                  'Listing available',
                  100,
                  'Listing available tools',
                ]}
                speed={60}
                cursor={!isToolsComplete}
                className={isToolsComplete ? "text-green-400" : "text-blue-400"}
              />
              
              {isToolsComplete && <CheckMark />}
            </div>

            {showTools && toolsExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="ml-4 mb-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  {TOOLS.map((tool, i) => (
                    <motion.div
                      key={tool.name}
                      className="flex items-center gap-2 bg-gray-700/30 p-2 rounded"
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={toolItemVariants}
                    >
                      <tool.icon width={16} height={16} />
                      <span className="text-xs">{tool.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Command 2: Get Tool Info */}
        {isToolsComplete && toolsCollapsed && (
          <div className="mb-4">
            <div className="mt-2 pl-3">
              <div 
                className="flex items-center gap-2 text-blue-400 cursor-pointer hover:text-blue-300 mb-1"
                onClick={() => isGmailInfoComplete && setGmailInfoExpanded(!gmailInfoExpanded)}
              >
                <svg 
                  className={`w-4 h-4 transform transition-transform ${gmailInfoExpanded ? 'rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
                
                <TypeAnimation
                  sequence={[
                    'Fetc',
                    100,
                    'Fetchi',
                    100,
                    'Fetchin',
                    100,
                    'Fetching',
                    100,
                    'Fetching the',
                    100,
                    'Fetching the d',
                    100,
                    'Fetching the det',
                    100,
                    'Fetching the deta',
                    100,
                    'Fetching the detai',
                    100,
                    'Fetching the detail',
                    100,
                    'Fetching the details',
                    100,
                    'Fetching the details of',
                    100,
                    'Fetching the details of the',
                    100,
                    'Fetching the details of the G',
                    100,
                    'Fetching the details of the Gm',
                    100,
                    'Fetching the details of the Gma',
                    100,
                    'Fetching the details of the Gmai',
                    100,
                    'Fetching the details of the Gmail',
                    100,
                    'Fetching the details of the Gmail t',
                    100,
                    'Fetching the details of the Gmail to',
                    100,
                    'Fetching the details of the Gmail too',
                    100,
                    'Fetching the details of the Gmail tool',
                    1000,
                    () => setShowGmailInfo(true)
                  ]}
                  speed={60}
                  cursor={!showGmailInfo}
                  className={isGmailInfoComplete ? "text-green-400" : "text-blue-400"}
                />
                
                {isGmailInfoComplete && <CheckMark />}
              </div>

              {showGmailInfo && gmailInfoExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="ml-4 mb-2"
                >
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.5 }}
                    className="pl-4 mt-2 pb-2 border-l-2 border-gray-700"
                  >
                    <div className="text-gray-400 mb-2">// Tool info:</div>
                    <div className="bg-gray-700/30 p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <GmailIcon width={16} height={16} />
                        <span className="text-yellow-300">gmail</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <div>{"actions: ['sendEmail', 'readEmails', 'createDraft']"}</div>
                        <div>{"auth: 'oauth'"}</div>
                        <div>{"description: 'Interact with Gmail'"}</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
        )}
        
        {/* Command 3: Call Tool */}
        {isGmailInfoComplete && gmailInfoCollapsed && (
          <div>
            <span className="text-blue-400">// Let your agent call the tool directly</span>
            <div className="flex items-start">
              <span className="text-purple-400">const</span> <span className="text-yellow-300">result</span> <span className="text-gray-400">=</span> <span className="text-cyan-300">await</span> <span>
                <TypeAnimation
                  sequence={[
                    'agentBase.callTool({',
                    500,
                  ]}
                  speed={50}
                  cursor={false}
                  className="text-gray-200"
                />
              </span>
            </div>
            <div className="pl-2">
              <TypeAnimation
                sequence={[
                  'toolId: "gmail",',
                  500,
                ]}
                speed={50}
                cursor={false}
                className="text-gray-200"
              />
            </div>
            <div className="pl-2">
              <TypeAnimation
                sequence={[
                  'action: "sendEmail",',
                  500,
                ]}
                speed={50}
                cursor={false}
                className="text-gray-200"
              />
            </div>
            <div className="pl-2">
              <TypeAnimation
                sequence={[
                  'params: { ... }',
                  500,
                ]}
                speed={50}
                cursor={false}
                className="text-gray-200"
              />
            </div>
            <div>
              <TypeAnimation
                sequence={[
                  '});',
                  500,
                  () => setShowCallTool(true)
                ]}
                speed={50}
                cursor={true}
                className="text-gray-200"
              />
            </div>
            
            {showCallTool && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.5 }}
                className="pl-4 mt-2 pb-2 border-l-2 border-gray-700"
              >
                <div className="text-gray-400 mb-2">// Response:</div>
                <div className="bg-gray-700/30 p-2 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <GmailIcon width={16} height={16} />
                    <span className="text-green-400">Success</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    <div>{"messageId: 'msg_123456789'"}</div>
                    <div>{"status: 'delivered'"}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 