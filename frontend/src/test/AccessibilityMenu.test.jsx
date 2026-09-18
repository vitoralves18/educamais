import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import AccessibilityMenu from '../components/AccessibilityMenu';

function renderMenu() {
  return render(
    <MemoryRouter>
      <AccessibilityProvider>
        <AccessibilityMenu onClose={() => {}} navigate={() => {}} />
      </AccessibilityProvider>
    </MemoryRouter>
  );
}

describe('AccessibilityMenu', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('aplica a classe font-large ao clicar em "A+"', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText('Fonte grande'));
    expect(document.documentElement.classList.contains('font-large')).toBe(true);
  });

  it('ativa o alto contraste ao clicar no botão correspondente', () => {
    renderMenu();
    fireEvent.click(screen.getByText(/Ajuste de Contraste/i));
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });

  it('mostra "(ativado)" após ligar o leitor de tela', () => {
    renderMenu();
    const button = screen.getByText(/Leitor de tela/i);
    fireEvent.click(button);
    expect(screen.getByText(/Leitor de tela \(ativado\)/i)).toBeInTheDocument();
  });

  it('persiste a preferência de fonte no localStorage', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText('Fonte pequena'));
    const stored = JSON.parse(localStorage.getItem('educamais_a11y'));
    expect(stored.fontSize).toBe('small');
  });
});
