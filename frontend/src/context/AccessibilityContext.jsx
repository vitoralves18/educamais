import { createContext, useContext, useEffect, useState } from 'react';

const AccessibilityContext = createContext(null);

const STORAGE_KEY = 'educamais_a11y';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { fontSize: 'medium', highContrast: false, screenReader: false };
}

export function AccessibilityProvider({ children }) {
  const [prefs, setPrefs] = useState(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    const root = document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${prefs.fontSize}`);

    root.classList.toggle('high-contrast', !!prefs.highContrast);
  }, [prefs]);

  const setFontSize = (fontSize) => setPrefs((p) => ({ ...p, fontSize }));
  const setHighContrast = (highContrast) => setPrefs((p) => ({ ...p, highContrast }));
  const setScreenReader = (screenReader) => setPrefs((p) => ({ ...p, screenReader }));

  const speak = (text) => {
    if (!prefs.screenReader) return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  const speakForce = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <AccessibilityContext.Provider
      value={{ ...prefs, setFontSize, setHighContrast, setScreenReader, speak, speakForce, setPrefs }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider');
  return ctx;
}
