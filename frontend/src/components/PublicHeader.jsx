import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AccessibilityMenu from './AccessibilityMenu';

export default function PublicHeader({ variant = 'default' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="public-header">
      <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(true)}
        aria-label="Abrir menu de acessibilidade"
      >
        <span className="menu-toggle-bars" aria-hidden="true">☰</span>
        <span className="menu-toggle-label">MENU</span>
      </button>

      <Link to="/" className="brand">EducaMais<span>+</span></Link>

      <Link to="/sobre" className="sobre-link">SOBRE</Link>

      {menuOpen && <AccessibilityMenu onClose={() => setMenuOpen(false)} navigate={navigate} />}
    </header>
  );
}
