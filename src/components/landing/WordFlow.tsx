import React, { useMemo } from 'react';

/**
 * ContinuousWordFlow component
 * Creates an infinite vertical flow of words with a seamless loop
 * 
 * @param words - Array of words to display in the flow
 * @param direction - Direction of the flow ('up' or 'down')
 */
export function ContinuousWordFlow({ words, direction = 'up' }: { words: string[], direction?: 'up' | 'down' }) {
  // Create a properly duplicated array of words for seamless animation
  const duplicatedWords = useMemo(() => {
    // Determine how many duplications we need based on word count
    const duplicationsNeeded = Math.ceil(100 / words.length); // Ensure enough words for the flow
    const result = [];
    
    // Duplicate the array enough times to ensure seamless flow
    for (let i = 0; i < duplicationsNeeded; i++) {
      result.push(...words);
    }
    
    return result;
  }, [words]);
  
  // Define colors that match the landing page gradient (blue to teal to green)
  const wordColors = [
    'rgb(59, 130, 246)',  // Blue-500
    'rgb(6, 182, 212)',   // Cyan-500
    'rgb(20, 184, 166)',  // Teal-500
    'rgb(16, 185, 129)',  // Emerald-500
    'rgb(79, 70, 229)',   // Indigo-600
    'rgb(139, 92, 246)',  // Purple-500
    'rgb(45, 212, 191)'   // Teal-400
  ];

  // Calculate fixed spacing between words to ensure consistency
  const wordSpacing = 60; // Increased spacing (in pixels)
  
  // Determine animation name based on direction
  const animationName = direction === 'up' ? 'flowUpwards' : 'flowDownwards';
  
  return (
    <div className="flow-container relative w-full md:w-40 h-full overflow-hidden">
      <div 
        className="flow-content-wrapper"
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {/* First animation container (original) */}
        <div 
          className="flow-content flex flex-col items-start md:items-center sm:items-end"
          style={{
            position: 'absolute',
            animation: `${animationName} 55s linear infinite`, // Slightly faster than previous
            height: 'auto',
            width: '100%',
            top: '0',
            left: '0'
          }}
        >
          {duplicatedWords.map((word, index) => {
            const colorIndex = index % wordColors.length;
            // Only render every 4th word for more spacing
            if (index % 4 === 0) {
              return (
                <div 
                  key={`${word}-${index}`} 
                  className="text-sm font-normal transition-all duration-500 hover:scale-105 word-element ai-processed"
                  style={{ 
                    height: `${wordSpacing}px`, // Fixed height space for each word
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    animation: 'aiPulse 4s infinite ease-in-out' // Add subtle pulsing effect
                  }}
                >
                  <div className="px-2 py-1 rounded-lg bg-background/30 backdrop-blur-sm border border-blue-400/10">
                    <span 
                      className="ai-word-text transition-all duration-300"
                      style={{
                        color: wordColors[colorIndex],
                        opacity: 0.6, // Slightly higher opacity
                        fontWeight: 500,
                        background: `linear-gradient(120deg, ${wordColors[colorIndex]}, transparent)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                      }}
                    >
                      {word}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
        
        {/* Second animation container (exact duplicate positioned to create seamless loop) */}
        <div 
          className="flow-content flex flex-col items-start md:items-center sm:items-end"
          style={{
            position: 'absolute',
            animation: `${animationName} 55s linear infinite`,
            animationDelay: '-27.5s', // Half of the animation duration
            height: 'auto',
            width: '100%',
            top: '0',
            left: '0'
          }}
        >
          {duplicatedWords.map((word, index) => {
            const colorIndex = index % wordColors.length;
            // Only render every 4th word but offset by 2 to ensure even distribution
            if (index % 4 === 2) {
              return (
                <div 
                  key={`${word}-dup-${index}`} 
                  className="text-sm font-normal transition-all duration-500 hover:scale-105 word-element ai-processed"
                  style={{ 
                    height: `${wordSpacing}px`, // Fixed height space for each word
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    animation: 'aiPulse 4s infinite ease-in-out', // Add subtle pulsing effect
                    animationDelay: `${index % 3}s` // Offset animation for variety
                  }}
                >
                  <div className="px-2 py-1 rounded-lg bg-background/30 backdrop-blur-sm border border-blue-400/10">
                    <span 
                      className="ai-word-text transition-all duration-300"
                      style={{
                        color: wordColors[colorIndex],
                        opacity: 0.6, // Slightly higher opacity
                        fontWeight: 500,
                        background: `linear-gradient(120deg, ${wordColors[colorIndex]}, transparent)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                      }}
                    >
                      {word}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes flowUpwards {
            0% {
              transform: translateY(100%);
            }
            100% {
              transform: translateY(-100%);
            }
          }
          
          @keyframes flowDownwards {
            0% {
              transform: translateY(-100%);
            }
            100% {
              transform: translateY(100%);
            }
          }
          
          @keyframes aiPulse {
            0%, 100% {
              filter: drop-shadow(0 0 1px rgba(56, 189, 248, 0.3));
              opacity: 0.6;
            }
            50% {
              filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.5));
              opacity: 0.9;
            }
          }
          
          .ai-processed:hover {
            filter: drop-shadow(0 0 5px rgba(56, 189, 248, 0.8));
          }
          
          .ai-word-text {
            position: relative;
            overflow: hidden;
          }
          
          /* Ensure consistent spacing between words */
          .word-element {
            box-sizing: border-box;
          }
        `
      }} />
    </div>
  );
}

/**
 * WordFlowContainer component
 * Container for the word flow animation, positioned on the right side of the page
 * Only visible on desktop (hidden on mobile and tablet)
 * Words flow from bottom to top, processed by AI
 */
export function WordFlowContainer() {
  // Define all words in a single constant that can be reused
  const flowWords = [
    // Original words (converted to CamelCase)
    "Emails", 
    "WhatsApp", 
    "Reminder", 
    "FollowUps", 
    "Newsletters", 
    "Prospection", 
    "Ads",
    
    // Additional requested words (converted to CamelCase)
    "Telegram",
    "Hiring",
    "SMS",
    "Feedback",
    "Facebook",
    "Instagram",
    "Website",
    "Reporting",
    "Monitoring",
    "FundRaising",
    "Sales",
    "Legal",
    "Contracting",
    
    // Additional words to reach 20 (converted to CamelCase)
    "Analytics",
    "Meetings",
    "Campaigns",
    "Scheduling",
    "Marketing",
    "Support",
    "Automation"
  ];
  
  return (
    <div className="hidden md:block fixed top-0 right-0 h-full w-40 overflow-hidden pointer-events-none z-0 opacity-80">
      <ContinuousWordFlow words={flowWords} direction="up" />
    </div>
  );
}

/**
 * LeftWordFlowContainer component
 * Container for the word flow animation, positioned on the left side of the page
 * Only visible on desktop (hidden on mobile and tablet)
 * Words flow from top to bottom, representing human-created tasks
 */
export function LeftWordFlowContainer() {
  // Define all words in a single constant that can be reused
  const flowWords = [
    // Original words (converted to CamelCase)
    "Emails", 
    "WhatsApp", 
    "Reminder", 
    "FollowUps", 
    "Newsletters", 
    "Prospection", 
    "Ads",
    
    // Additional requested words (converted to CamelCase)
    "Telegram",
    "Hiring",
    "SMS",
    "Feedback",
    "Facebook",
    "Instagram",
    "Website",
    "Reporting",
    "Monitoring",
    "FundRaising",
    "Sales",
    "Legal",
    "Contracting",
    
    // Additional words to reach 20 (converted to CamelCase)
    "Analytics",
    "Meetings",
    "Campaigns",
    "Scheduling",
    "Marketing",
    "Support",
    "Automation"
  ];

  return (
    <div className="hidden md:block fixed top-0 left-0 h-full w-40 overflow-hidden pointer-events-none z-0 opacity-80">
      <ContinuousWordFlow words={flowWords} direction="down" />
    </div>
  );
} 