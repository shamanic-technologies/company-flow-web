/**
 * ShimmeringIndicator Component
 * 
 * Displays an animated "shimmering" text with an icon,
 * to indicate an ongoing process like thinking or tool calling.
 */
import { Brain } from 'lucide-react';

interface ShimmeringIndicatorProps {
  text: string;
}

export const ShimmeringIndicator = ({ text }: ShimmeringIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Brain size={12} className="animate-pulse" />
      <span className="inline-block bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] bg-clip-text text-transparent will-change-[background-position]">
        {text}
      </span>
    </div>
  );
}; 