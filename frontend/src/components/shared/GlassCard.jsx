import React from 'react';

export default function GlassCard({ children, className = '', onClick, hover = false, id }) {
  const baseClasses = 'glass-panel rounded-[var(--radius-lg)] p-4 transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  
  return (
    <div 
      id={id}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
