import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useVoice } from '../hooks/useVoice';
import { useDarkMode } from '../hooks/useDarkMode';

import ChatBubble from '../components/chat/ChatBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import SymptomChips from '../components/chat/SymptomChips';
import VoiceButton from '../components/chat/VoiceButton';
import EmergencyOverlay from '../components/emergency/EmergencyOverlay';
import SeasonalAlert from '../components/SeasonalAlert';
import DarkModeToggle from '../components/layout/DarkModeToggle';

export default function Chat() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const { messages, isLoading, sendMessage } = useChat();
  const { isListening, transcript, startListening, stopListening, speak, isVoiceEnabled, toggleVoice } = useVoice();
  
  const [inputValue, setInputValue] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice transcript handling
  useEffect(() => {
    if (transcript) setInputValue(transcript);
  }, [transcript]);

  // Emergency detection
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.isEmergency) {
      setEmergencyAlert(lastMsg.prediction?.topDisease || 'Critical Condition');
    }
    if (lastMsg?.sender === 'bot' && isVoiceEnabled) {
      speak(lastMsg.text);
    }
  }, [messages, isVoiceEnabled, speak]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text && symptoms.length === 0) return;

    let finalMessage = text;
    if (symptoms.length > 0) {
      finalMessage = `${text ? text + '. ' : ''}My symptoms are: ${symptoms.join(', ')}`;
    }

    setInputValue('');
    setSymptoms([]); // clear chips after send
    await sendMessage(finalMessage, { symptoms });
  };

  const quickPrompts = [
    "I have a headache",
    "Feeling tired",
    "Stomach pain",
    "Check symptoms"
  ];

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[440px] mx-auto bg-[var(--bg-secondary)] relative overflow-hidden text-[var(--text-primary)]">
      
      {/* Header */}
      <header className="flex-none h-16 glass border-b border-[var(--glass-border)] z-20 flex items-center justify-between px-4 sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 -ml-2 rounded-full hover:bg-[var(--border-color)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-none">AI Health Assistant</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">Online</span>
              
              {/* ECG Animation (Mini version) */}
              <div className="w-12 h-3 ml-2 overflow-hidden opacity-70">
                <svg viewBox="0 0 120 28" className="w-full h-full">
                  <polyline 
                    points="0,14 20,14 28,14 32,2 36,26 40,14 50,14 54,8 58,14 80,14 84,4 88,24 92,14 120,14" 
                    fill="none" 
                    stroke="var(--color-primary)" 
                    strokeWidth="4"
                    strokeDasharray="300"
                    strokeDashoffset="300"
                    style={{ animation: 'ecg-draw 2.5s ease-in-out infinite' }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={toggleVoice} className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors">
            {isVoiceEnabled ? '🔊' : '🔇'}
          </button>
          <DarkModeToggle id="chat-theme-toggle" />
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollable-content relative z-10">
        <SeasonalAlert />
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl mb-4 border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              🤖
            </div>
            <h2 className="text-xl font-bold mb-2">How are you feeling today?</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              Describe your symptoms, or use voice input to talk to me.
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => { setInputValue(prompt); sendMessage(prompt); }}
                  className="px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-sm shadow-sm hover:border-primary hover:text-primary transition-all active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.text}
                isBot={msg.sender === 'bot'}
                timestamp={msg.timestamp}
                prediction={msg.prediction}
                isEmergency={msg.isEmergency}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} className="h-2" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-none px-3 pt-2 pb-safe bg-gradient-to-t from-[var(--bg-secondary)] via-[var(--bg-secondary)] to-transparent z-20 pb-4">
        <div className="mb-2">
          <SymptomChips 
            symptoms={symptoms} 
            onAdd={(sym) => !symptoms.includes(sym) && setSymptoms([...symptoms, sym])}
            onRemove={(sym) => setSymptoms(symptoms.filter(s => s !== sym))}
          />
        </div>
        
        <form onSubmit={handleSend} className="flex items-end gap-2 relative max-w-full">
          <div className="flex-1 relative glass-panel rounded-3xl border border-[var(--glass-border)] shadow-lg overflow-hidden flex items-end bg-[var(--bg-card)]">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your symptoms..."
              className="w-full bg-transparent border-none py-[14px] pl-5 pr-[52px] text-[15px] outline-none resize-none overflow-hidden max-h-32 placeholder:text-[var(--text-secondary)] placeholder:font-light"
              rows={1}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute right-1 bottom-1">
              <VoiceButton 
                isListening={isListening} 
                onClick={(e) => { e.preventDefault(); isListening ? stopListening() : startListening(); }}
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={(!inputValue.trim() && symptoms.length === 0) || isLoading}
            className="w-12 h-12 flex-none rounded-full bg-gradient-to-br from-primary to-teal-500 text-white flex items-center justify-center hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-90 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-[0_4px_14px_rgba(16,185,129,0.25)]"
          >
            <svg className="w-[22px] h-[22px] transform rotate-90 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      <EmergencyOverlay 
        isOpen={!!emergencyAlert} 
        onClose={() => setEmergencyAlert(null)}
        category={emergencyAlert}
      />
      
      <style>{`
        @keyframes ecg-draw {
          0%  { stroke-dashoffset: 300; opacity: 1; }
          70% { stroke-dashoffset: 0;   opacity: 1; }
          90% { stroke-dashoffset: 0;   opacity: 0; }
          100%{ stroke-dashoffset: 300; opacity: 0; }
        }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 16px); }
      `}</style>
    </div>
  );
}
