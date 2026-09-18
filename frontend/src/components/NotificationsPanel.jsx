import { useEffect, useState } from 'react';
import { api } from '../api/client';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr.replace(' ', 'T') + 'Z').getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'agora mesmo';
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

export default function NotificationsPanel({ onClose, onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listNotifications();
      setNotifications(data.notifications);
      onUnreadChange && onUnreadChange(data.unreadCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await api.markAllNotificationsRead();
    load();
  };

  const markOne = async (id) => {
    await api.markNotificationRead(id);
    load();
  };

  return (
    <div className="notif-panel" role="dialog" aria-label="Notificações">
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)' }}>
        <strong>Notificações</strong>
        <button className="btn btn-sm btn-outline" onClick={markAll}>Marcar todas como lidas</button>
      </div>
      {loading && <div className="notif-empty">Carregando...</div>}
      {!loading && notifications.length === 0 && <div className="notif-empty">Nenhuma notificação por aqui.</div>}
      {!loading && notifications.map((n) => (
        <button
          key={n.id}
          className={`notif-item ${n.read ? '' : 'unread'}`}
          style={{ width: '100%', textAlign: 'left', background: n.read ? 'transparent' : undefined, border: 'none' }}
          onClick={() => markOne(n.id)}
        >
          {n.message}
          <div className="notif-item-time">{timeAgo(n.created_at)}</div>
        </button>
      ))}
    </div>
  );
}
