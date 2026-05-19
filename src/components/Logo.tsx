import React from 'react';
import { cn } from '../lib/utils';

export const Logo: React.FC<{ className?: string, showTagline?: boolean }> = ({ className, showTagline = false }) => {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-0.5 font-black tracking-tighter text-brand-dark overflow-visible">
        <span className="text-4xl">D</span>
        <span className="text-4xl">I</span>
        <span className="text-4xl">V</span>
        <span className="text-3xl text-brand-yellow px-0.5 transform rotate-12">/</span>
        <span className="text-4xl">S</span>
        <span className="text-4xl">I</span>
        <div className="w-8 h-8 bg-brand-teal rounded-full ml-1" />
      </div>
      {showTagline && (
        <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 mt-2 whitespace-nowrap">
          Bagi kerja, <span className="text-brand-teal">AI Lebih baik</span>
        </p>
      )}
    </div>
  );
};
