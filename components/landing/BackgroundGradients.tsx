import React from 'react';

/**
 * BackgroundGradients component
 * Provides subtle background gradient effects for the landing page
 */
export function BackgroundGradients() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-purple-500/5 blur-[100px]"></div>
      <div className="absolute bottom-[20%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-blue-600/5 blur-[120px]"></div>
      <div className="absolute top-[35%] left-[20%] w-[25vw] h-[25vw] rounded-full bg-emerald-500/5 blur-[80px]"></div>
    </div>
  );
} 