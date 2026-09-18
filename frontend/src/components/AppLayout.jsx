import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsPanel from './NotificationsPanel';
import { useEffect } from 'react';
import { api } from '../api/client';

const roleLabel = { aluno: 'Aluno', tutor: 'Tutor', responsavel: 'Responsável' };

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.listNotifications().then((d) => setUnread(d.unreadCount)).catch(() => {});
  }, []);

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
      <header className="app-header">
        <div className="app-header-left">
          <Link to="/dashboard" className="app-brand">EducaMais<span>+</span></Link>
          <button
            className="nav-toggle"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-controls="app-primary-nav"
            aria-label={navOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          >
            ☰
          </button>
          <nav className="app-nav" id="app-primary-nav" data-open={navOpen}>
            <NavLink to="/dashboard" onClick={() => setNavOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Painel</NavLink>
            <NavLink to="/biblioteca" onClick={() => setNavOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Biblioteca</NavLink>
            <NavLink to="/forum" onClick={() => setNavOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Fórum</NavLink>
            {user?.role === 'tutor' && (
              <NavLink to="/avaliar" onClick={() => setNavOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Avaliar aluno</NavLink>
            )}
            {(user?.role === 'aluno' || user?.role === 'responsavel') && (
              <NavLink to="/progresso" onClick={() => setNavOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Progresso</NavLink>
            )}
            <NavLink to="/perfil" onClick={() => setNavOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Perfil</NavLink>
          </nav>
        </div>

        <div className="app-header-right">
          <button
            className="notif-bell"
            aria-label="Notificações"
            onClick={() => setNotifOpen((v) => !v)}
          >
            🔔
            {unread > 0 && <span className="notif-dot">{unread}</span>}
          </button>

          <div className="user-chip">
            <span className="avatar-circle">{initials}</span>
            <div className="user-chip-info">
              <span className="user-chip-name">{user?.name}</span>
              <span className="user-chip-role">{roleLabel[user?.role] || user?.role}</span>
            </div>
          </div>

          <button className="btn btn-sm btn-outline" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {notifOpen && (
        <NotificationsPanel
          onClose={() => setNotifOpen(false)}
          onUnreadChange={setUnread}
        />
      )}

      <main className="app-main" id="main-content" tabIndex={-1}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
