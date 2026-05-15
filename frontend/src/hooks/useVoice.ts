import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
}

export function useVoice(options: UseVoiceOptions = {}) {
  const { rate = 1.0, pitch = 1.0, volume = 0.9, voiceName } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const getPreferredVoice = useCallback(() => {
    if (voices.length === 0) return null;
    if (voiceName) {
      const match = voices.find((v) => v.name.includes(voiceName));
      if (match) return match;
    }
    // Prefer natural-sounding English voices
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    );
    return preferred || voices.find((v) => v.lang.startsWith('en')) || voices[0];
  }, [voiceName, voices]);

  const speak = useCallback(
    (text: string) => {
      if (!isEnabled || !text.trim()) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      const voice = getPreferredVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isEnabled, rate, pitch, volume, getPreferredVoice]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggle = useCallback(() => {
    if (isSpeaking) stop();
    setIsEnabled((prev) => !prev);
  }, [isSpeaking, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return { speak, stop, toggle, isSpeaking, isEnabled, setIsEnabled };
}
