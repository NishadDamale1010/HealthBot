import React from 'react';
import AnimatedButton from '../shared/AnimatedButton';

export default function EmergencyOverlay({ isOpen, onClose, category, id }) {
  if (!isOpen) return null;

  return (
    <div id={id} className="fixed inset-0 z-[100] flex flex-col bg-red-950/90 backdrop-blur-xl animate-fadeIn p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-[var(--color-danger)] mix-blend-overlay animate-pulse-slow opacity-20 pointer-events-none"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative z-10 text-center">
        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-bounce-custom">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">MEDICAL EMERGENCY</h1>
        <p className="text-red-200 text-lg mb-8">
          Possible {category || 'critical condition'} detected. Seek immediate medical help.
        </p>

        <div className="w-full space-y-4 mb-8">
          <a href="tel:112" className="block w-full py-4 bg-white text-red-600 rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-transform">
            📞 CALL 112 (Emergency)
          </a>
          <a href="tel:108" className="block w-full py-3 bg-red-800 text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform border border-red-600">
            🚑 CALL 108 (Ambulance)
          </a>
        </div>

        <div className="w-full bg-black/30 rounded-xl p-4 text-left border border-white/10 mb-8">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Immediate Actions
          </h3>
          <ul className="text-red-100 text-sm space-y-2">
            <li>• Stay calm and do not panic.</li>
            <li>• Ensure the person is in a safe position.</li>
            <li>• Do not give anything to eat or drink.</li>
            <li>• Keep them comfortable while waiting for help.</li>
          </ul>
        </div>

        <AnimatedButton 
          variant="ghost" 
          onClick={onClose}
          className="text-white/70 hover:text-white border border-white/20 rounded-full px-6"
        >
          I understand, close alert
        </AnimatedButton>
      </div>
    </div>
  );
}
