import React from 'react';

export default function SkeletonLoader({ lines = 1, width = 'w-full', circle = false, className = '', id }) {
  if (circle) {
    return (
      <div 
        id={id}
        className={`animate-pulse-slow bg-[var(--border-color)] rounded-full ${width} ${className}`}
        style={{ aspectRatio: '1/1' }}
      ></div>
    );
  }

  return (
    <div id={id} className={`space-y-3 ${width} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`animate-pulse-slow bg-[var(--border-color)] rounded-[var(--radius-sm)] h-4 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`}
        ></div>
      ))}
    </div>
  );
}
