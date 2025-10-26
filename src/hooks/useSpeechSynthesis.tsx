import { useState, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stop previous audio
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Bahasa Indonesia
      utterance.rate = 0.85; // kecepatan baca (agak lambat untuk kejelasan)
      utterance.pitch = 1; // nada normal
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Browser tidak support Text-to-Speech');
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, stop, isSpeaking };
};
