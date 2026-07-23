import React, { useState } from 'react';

export default function SymptomChips({ symptoms = [], onAdd, onRemove, id }) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Sore Throat', 'Chest Pain'
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
      setIsAdding(false);
    }
  };

  const handleQuickAdd = (sym) => {
    onAdd(sym);
    setIsAdding(false);
  };

  return (
    <div id={id} className="w-full mb-3 px-2">
      <div className="flex flex-wrap gap-2 items-center">
        {symptoms.map((sym, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fadeIn"
          >
            <span>{sym}</span>
            <button 
              onClick={() => onRemove(sym)}
              className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-sm"
          >
            + Add Symptom
          </button>
        ) : (
          <div className="w-full mt-2 glass-panel p-3 rounded-xl animate-fadeIn relative z-10 shadow-lg">
            <form onSubmit={handleAdd} className="flex gap-2 mb-3">
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a symptom..."
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary text-[var(--text-primary)]"
              />
              <button type="submit" className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">Add</button>
              <button type="button" onClick={() => setIsAdding(false)} className="text-[var(--text-secondary)] px-2 hover:text-[var(--color-danger)]">✕</button>
            </form>
            
            <div className="text-xs text-[var(--text-secondary)] mb-2 font-medium">Common:</div>
            <div className="flex flex-wrap gap-1.5">
              {commonSymptoms.filter(s => !symptoms.includes(s)).map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAdd(sym)}
                  className="px-2 py-1 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] hover:border-primary hover:text-primary transition-colors"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
