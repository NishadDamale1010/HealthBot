import React, { useState } from 'react';
import GlassCard from './GlassCard';
import AnimatedButton from './AnimatedButton';

export default function OnboardingFlow({ onComplete, id }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: 'AI Health Assistant',
      description: 'Your personal AI-powered health companion. Get instant insights about your symptoms.',
      icon: '🩺'
    },
    {
      title: 'Symptom Analysis',
      description: 'Tell us how you feel. We use advanced AI to predict possible conditions and risks.',
      icon: '🤖'
    },
    {
      title: 'Get Started',
      description: 'Ready to take control of your health? Let\'s begin.',
      icon: '✨'
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboarding_complete', 'true');
      if (onComplete) onComplete();
    }
  };

  return (
    <div id={id} className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)] p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-light)]/20 to-[var(--color-info)]/20"></div>
      
      <GlassCard className="relative w-full max-w-sm flex flex-col items-center text-center p-8 z-10 animate-slideUp">
        <div className="text-6xl mb-6 animate-bounce-custom">
          {slides[step].icon}
        </div>
        
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          {slides[step].title}
        </h2>
        
        <p className="text-[var(--text-secondary)] mb-8 min-h-[4rem]">
          {slides[step].description}
        </p>
        
        <div className="flex gap-2 mb-8">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-2 bg-[var(--border-color)]'}`}
            />
          ))}
        </div>
        
        <AnimatedButton onClick={handleNext} className="w-full">
          {step === slides.length - 1 ? 'Get Started' : 'Next'}
        </AnimatedButton>
      </GlassCard>
    </div>
  );
}
