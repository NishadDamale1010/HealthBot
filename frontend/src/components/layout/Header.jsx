import React from 'react';
import DarkModeToggle from './DarkModeToggle';

export default function Header({ title, showBack = false, onBack, id }) {
  return (
    <header 
      id={id || 'app-header'} 
      className="sticky top-0 z-40 glass border-b border-[var(--glass-border)] h-16 flex items-center justify-between px-4"
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-[var(--border-color)] transition-colors text-[var(--text-primary)]"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md animate-pulse-slow">
            HB
          </div>
          <h1 className="font-semibold text-lg text-[var(--text-primary)] truncate">
            {title || 'HealthBot'}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <DarkModeToggle id="header-theme-toggle" />
        <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors">
          <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </header>
  );
}
