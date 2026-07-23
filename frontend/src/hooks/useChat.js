import { useState, useCallback, useRef } from 'react';
import API from '../services/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use a ref to persist sessionId across renders without causing re-renders when it changes initially
  const sessionIdRef = useRef(localStorage.getItem('sessionId') || `sess_${Date.now()}`);

  const sendMessage = useCallback(async (text, additionalData = {}) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await API.post('/api/chat', {
        message: text,
        sessionId: sessionIdRef.current,
        ...additionalData
      });

      const data = response.data;
      if (data.sessionId && data.sessionId !== sessionIdRef.current) {
         sessionIdRef.current = data.sessionId;
         localStorage.setItem('sessionId', data.sessionId);
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: data.reply || data.message || '',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        prediction: data.prediction || null,
        isEmergency: data.isEmergency || false,
        messageType: data.messageType || 'casual'
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to send message. Please try again.');
      
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error connecting to the server.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('sessionId');
    sessionIdRef.current = `sess_${Date.now()}`;
  }, []);

  return { 
    messages, 
    isLoading, 
    sendMessage, 
    clearChat, 
    sessionId: sessionIdRef.current, 
    error 
  };
}
