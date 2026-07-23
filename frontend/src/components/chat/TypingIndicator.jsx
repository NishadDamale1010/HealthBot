import React from 'react';

export default function TypingIndicator({ id }) {
  return (
    <div id={id} className="flex flex-col items-start mb-4 animate-fadeIn">
      <div className="glass-panel px-4 py-3 rounded-2xl rounded-bl-sm inline-flex items-center gap-1.5 border-l-4 border-l-primary">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-[10px] text-[var(--text-secondary)] mt-1 ml-2 font-medium">AI is thinking...</span>
    </div>
  );
}
