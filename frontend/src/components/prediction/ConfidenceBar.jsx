import React, { useEffect, useState } from 'react';

export default function ConfidenceBar({ value = 0, label, id }) {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    // Animate on mount
    const timer = setTimeout(() => setWidth(value * 100), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = (val) => {
    if (val < 0.3) return 'bg-[var(--color-danger)]';
    if (val < 0.6) return 'bg-[var(--color-warning)]';
    return 'bg-[var(--color-success)]';
  };

  return (
    <div id={id} className="w-full mt-2 mb-1">
      <div className="flex justify-between text-xs mb-1 text-[var(--text-secondary)]">
        <span>{label || 'Confidence'}</span>
        <span className="font-medium">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="w-full bg-[var(--border-color)] rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ease-out ${getColor(value)}`}
          style={{ width: `${width}%` }}
        ></div>
      </div>
    </div>
  );
}
