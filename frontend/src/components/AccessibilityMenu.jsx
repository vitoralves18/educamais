import { useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AccessibilityMenu({ onClose, navigate }) {
  const { fontSize, setFontSize, highContrast, setHighContrast, screenReader, setScreenReader, speakForce } =
    useAccessibility();
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.querySelector('button')?.focus();
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const toggleScreenReader = () => {
    const next = !screenReader;
    setScreenReader(next);
    if (next) speakForce('Leitor de tela ativado. O EducaMais vai ler os principais textos em voz alta.');
  };

  const goTo = (path) => {
    onClose();
    if (navigate) navigate(path);
  };

  return (
    <div className="a11y-overlay" role="dialog" aria-label="Menu de acessibilidade" aria-modal="true">
      <div className="a11y-panel" ref={panelRef}>
        <div className="a11y-panel-header">
          <span>MENU</span>
          <button className="a11y-close" onClick={onClose} aria-label="Fechar menu">✕</button>
        </div>

        <nav className="a11y-list">
          <button className="a11y-item" onClick={toggleScreenReader}>
            Leitor de tela {screenReader ? '(ativado)' : ''}
          </button>

          <button className="a11y-item" onClick={() => setHighContrast(!highContrast)}>
            Ajuste de Contraste {highContrast ? '(ativado)' : ''}
          </button>

          <div className="a11y-item a11y-item-fonts">
            Ajuste de fonte
            <div className="a11y-font-buttons">
              <button
                className={fontSize === 'small' ? 'active' : ''}
                onClick={() => setFontSize('small')}
                aria-label="Fonte pequena"
              >A-</button>
              <button
                className={fontSize === 'medium' ? 'active' : ''}
                onClick={() => setFontSize('medium')}
                aria-label="Fonte média"
              >A</button>
              <button
                className={fontSize === 'large' ? 'active' : ''}
                onClick={() => setFontSize('large')}
                aria-label="Fonte grande"
              >A+</button>
            </div>
          </div>

          <button className="a11y-item" onClick={() => goTo('/biblioteca')}>
            Atividades interativas
          </button>
        </nav>

        <div className="a11y-roles">
          <button className="a11y-role" onClick={() => goTo('/registrar?role=aluno')}>Aluno</button>
          <button className="a11y-role" onClick={() => goTo('/registrar?role=tutor')}>Professor</button>
          <button className="a11y-role" onClick={() => goTo('/registrar?role=responsavel')}>Responsável</button>
        </div>
      </div>
      <button className="a11y-backdrop" onClick={onClose} aria-label="Fechar menu" />
    </div>
  );
}
