import React from 'react';

export default function RiskBadge({ level = 'Low', id }) {
  const getStyles = () => {
    switch (level.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-[var(--color-danger)] text-white',
          icon: '🚨',
          animate: 'animate-pulse'
        };
      case 'high':
        return {
          bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
          icon: '⚠️',
          animate: 'animate-pulse-slow'
        };
      case 'medium':
        return {
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
          icon: '⚡',
          animate: ''
        };
      case 'low':
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
          icon: '✅',
          animate: ''
        };
    }
  };

  const styles = getStyles();

  return (
    <div id={id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.animate}`}>
      <span>{styles.icon}</span>
      <span>{level} Risk</span>
    </div>
  );
}
