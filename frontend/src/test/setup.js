import '@testing-library/jest-dom/vitest';

// Mock do speechSynthesis (não existe no jsdom) usado pelo leitor de tela
if (!window.speechSynthesis) {
  window.speechSynthesis = { cancel: () => {}, speak: () => {} };
}
if (!window.SpeechSynthesisUtterance) {
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
}
