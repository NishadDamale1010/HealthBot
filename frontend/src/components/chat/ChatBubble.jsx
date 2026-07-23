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
    ? `glass-panel rounded-tr-2xl rounded-br-2xl rounded-bl-sm rounded-tl-2xl border-l-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${isEmergency ? 'border-l-[var(--color-danger)]' : 'border-l-primary'}`
    : 'bg-gradient-to-br from-[#10b981] to-[#0d9488] text-white rounded-tl-2xl rounded-bl-2xl rounded-br-sm rounded-tr-2xl shadow-[0_8px_16px_rgba(16,185,129,0.25)]';

  return (
    <div id={id} className={`flex w-full mb-5 animate-slideUp ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[88%] px-4 py-3 relative group transition-all duration-300 ${bubbleClasses}`}>
        {isEmergency && isBot && (
          <div className="absolute -top-3 -right-3 text-2xl animate-bounce-custom drop-shadow-md z-10">🚨</div>
        )}
        
        <div className={`text-[15px] leading-relaxed tracking-wide ${isBot ? 'text-[var(--text-primary)]' : 'text-white'}`}>
          {formatText(message)}
        </div>
        
        {prediction && isBot && (
          <div className="mt-4">
            <PredictionCard prediction={prediction} />
          </div>
        )}

        {isEmergency && isBot && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 shadow-inner">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚨</span>
              <h4 className="font-bold tracking-tight">Medical Emergency</h4>
            </div>
            <p className="text-sm mb-4 font-medium opacity-90">Please seek immediate medical attention.</p>
            <a href="tel:108" className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white rounded-[12px] font-bold shadow-[0_8px_20px_rgba(220,38,38,0.3)] hover:bg-red-700 active:scale-95 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              CALL 108 (Ambulance)
            </a>
          </div>
        )}
        
        {timestamp && (
          <div className={`text-[10px] mt-2 text-right font-medium opacity-70 ${isBot ? 'text-[var(--text-secondary)]' : 'text-emerald-100'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}
