import React, { useState } from 'react';

export default function VoiceButton({ isListening, onClick, id }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
        isListening 
          ? 'bg-[var(--color-danger)] text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
      }`}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening && (
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-danger)] animate-ping opacity-75"></div>
      )}
      
      {isListening ? (
        <div className="flex items-end gap-0.5 h-4">
          <div className="w-1 bg-white rounded-full animate-bounce-custom h-4" style={{ animationDuration: '0.6s' }}></div>
          <div className="w-1 bg-white rounded-full animate-bounce-custom h-2" style={{ animationDuration: '0.8s', animationDelay: '0.1s' }}></div>
          <div className="w-1 bg-white rounded-full animate-bounce-custom h-3" style={{ animationDuration: '0.7s', animationDelay: '0.2s' }}></div>
        </div>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}
