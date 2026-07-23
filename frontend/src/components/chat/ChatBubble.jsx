import React from 'react';
import PredictionCard from '../prediction/PredictionCard';

export default function ChatBubble({ message, isBot, timestamp, prediction, isEmergency, id }) {
  const formatText = (text) => {
    if (!text) return null;
    // Simple markdown support (bold and newlines)
    const formattedLines = text.split('\n').map((line, i) => {
      // Handle bold
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
    return formattedLines;
  };

  const bubbleClasses = isBot
    ? `glass-panel rounded-tr-2xl rounded-br-2xl rounded-bl-sm rounded-tl-2xl border-l-4 ${isEmergency ? 'border-l-[var(--color-danger)]' : 'border-l-primary'}`
    : 'bg-primary text-white rounded-tl-2xl rounded-bl-2xl rounded-br-sm rounded-tr-2xl shadow-md';

  return (
    <div id={id} className={`flex w-full mb-4 animate-slideUp ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] px-4 py-3 relative group ${bubbleClasses}`}>
        {isEmergency && isBot && (
          <div className="absolute -top-3 -right-3 text-2xl animate-bounce-custom">🚨</div>
        )}
        
        <div className={`text-sm md:text-base leading-relaxed ${isBot ? 'text-[var(--text-primary)]' : 'text-white'}`}>
          {formatText(message)}
        </div>
        
        {prediction && isBot && (
          <div className="mt-3">
            <PredictionCard prediction={prediction} />
          </div>
        )}
        
        {timestamp && (
          <div className={`text-[10px] mt-1 text-right ${isBot ? 'text-[var(--text-secondary)]' : 'text-emerald-100'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}
