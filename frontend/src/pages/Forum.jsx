import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Forum() {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);

  const loadChannels = async () => {
    const data = await api.listChannels();
    setChannels(data.channels);
    if (!activeId && data.channels.length) setActiveId(data.channels[0].id);
  };

  const loadMessages = async (channelId) => {
    if (!channelId) return;
    const data = await api.listMessages(channelId);
    setMessages(data.messages);
  };

  useEffect(() => { loadChannels(); }, []);
  useEffect(() => { loadMessages(activeId); }, [activeId]);
  useEffect(() => { listRef.current?.scrollTo(0, listRef.current.scrollHeight); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    try {
      await api.sendMessage(activeId, text.trim());
      setText('');
      loadMessages(activeId);
    } catch (err) {
      setError(err.message);
    }
  };

  const createChannel = async (e) => {
    e.preventDefault();
    if (!newChannel.trim()) return;
    const data = await api.createChannel(newChannel.trim());
    setNewChannel('');
    await loadChannels();
    setActiveId(data.channel.id);
  };

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Fórum</h1>
          <p style={{ color: 'var(--color-muted)' }}>Converse, tire dúvidas e apoie a comunidade EducaMais+.</p>
        </div>
      </div>

      <div className="forum-layout">
        <aside className="forum-sidebar">
          <div className="forum-sidebar-header">💬 Canais</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {channels.map((c) => (
              <button
                key={c.id}
                className={`channel-item ${c.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(c.id)}
              >
                <span className="avatar-circle" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                  {c.name.slice(0, 2).toUpperCase()}
                </span>
                {c.name}
              </button>
            ))}
          </div>
          <form onSubmit={createChannel} style={{ padding: 12, borderTop: '2px solid var(--color-border)', display: 'flex', gap: 6 }}>
            <input
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              placeholder="Novo canal..."
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '2px solid var(--color-border)' }}
            />
            <button className="btn btn-sm btn-outline" type="submit">+</button>
          </form>
        </aside>

        <div className="forum-main">
          <div className="forum-messages" ref={listRef}>
            {messages.length === 0 && <p style={{ color: 'var(--color-muted)' }}>Nenhuma mensagem ainda. Seja o primeiro a escrever!</p>}
            {messages.map((m) => (
              <div key={m.id} className={`message-bubble ${m.user_id === user.id ? 'own' : ''}`}>
                <div className="meta">{m.author_name} · {m.author_role}</div>
                <span className="bubble-text">{m.content}</span>
              </div>
            ))}
          </div>
          {error && <div className="error-banner" role="alert" style={{ margin: '0 16px' }}>{error}</div>}
          <form className="forum-composer" onSubmit={sendMessage}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva sua mensagem..."
              aria-label="Mensagem"
            />
            <button className="btn btn-primary" type="submit" disabled={!activeId}>Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
