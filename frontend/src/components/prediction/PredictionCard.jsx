import React, { useState } from 'react';
import GlassCard from '../shared/GlassCard';
import ConfidenceBar from './ConfidenceBar';
import RiskBadge from './RiskBadge';
import AnimatedButton from '../shared/AnimatedButton';

export default function PredictionCard({ prediction, id }) {
  const [expanded, setExpanded] = useState(false);

  if (!prediction) return null;

  const { topDisease, confidence = 0, riskLevel = 'Low', topFive = [], explanation, actionItems = [] } = prediction;
  const isHighRisk = ['high', 'critical'].includes(riskLevel.toLowerCase());

  return (
    <GlassCard id={id} className="w-full animate-slideUp border-t-4 border-t-primary my-2">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{topDisease}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Primary AI Prediction</p>
        </div>
        <RiskBadge level={riskLevel} />
      </div>

      <ConfidenceBar value={confidence} label="AI Confidence" />

      {isHighRisk && (
        <div className="mt-3 p-2 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-[var(--radius-sm)] flex items-start gap-2">
          <span className="text-[var(--color-danger)] mt-0.5">⚠️</span>
          <p className="text-xs text-[var(--color-danger)] font-medium">
            Please consult a healthcare professional immediately. Do not rely solely on this prediction.
          </p>
        </div>
      )}

      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 py-1.5 flex justify-center items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-primary transition-colors border-t border-[var(--border-color)]"
      >
        <span>{expanded ? 'Show Less' : 'Why this prediction?'}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-4 animate-fadeIn">
          {topFive && topFive.length > 1 && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wider">Other Possibilities</h4>
              <ul className="space-y-2">
                {topFive.slice(1, 4).map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-secondary)] truncate pr-2">{item.disease}</span>
                    <span className="text-xs font-medium bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {explanation && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wider">Matched Symptoms</h4>
              <div className="flex flex-wrap gap-1.5">
                {explanation.matched?.map((sym, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          )}

          {actionItems && actionItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wider">Recommended Actions</h4>
              <ul className="space-y-1.5">
                {actionItems.map((action, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2 text-[var(--text-secondary)]">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-[10px] text-[var(--text-secondary)] opacity-70 text-center border-t border-[var(--border-color)] pt-2">
        This is an AI prediction, not a medical diagnosis.
      </div>
    </GlassCard>
  );
}
