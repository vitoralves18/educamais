import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const typeIcon = { video: '🎬', texto: '📄', atividade: '🧩' };
const typeLabel = { video: 'Vídeo', texto: 'Texto', atividade: 'Atividade' };

export default function Library() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(params.get('novo') === '1');

  const q = params.get('q') || '';
  const subject = params.get('subject') || '';
  const type = params.get('type') || '';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [resData, favData] = await Promise.all([
        api.listResources({ q, subject, type }),
        api.listFavorites(),
      ]);
      setResources(resData.resources);
      setFavoriteIds(new Set(favData.favorites.map((f) => f.id)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [q, subject, type]);
  useEffect(() => { api.listSubjects().then((d) => setSubjects(d.subjects)).catch(() => {}); }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  const toggleFavorite = async (id) => {
    if (favoriteIds.has(id)) {
      await api.removeFavorite(id);
      setFavoriteIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    } else {
      await api.addFavorite(id);
      setFavoriteIds((prev) => new Set(prev).add(id));
    }
  };

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Biblioteca de recursos</h1>
          <p style={{ color: 'var(--color-muted)' }}>Materiais adaptados: vídeos, textos e atividades interativas.</p>
        </div>
        {user?.role === 'tutor' && (
          <button className="btn btn-accent" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Fechar' : '+ Disponibilizar material'}
          </button>
        )}
      </div>

      {showForm && user?.role === 'tutor' && (
        <NewResourceForm onCreated={() => { setShowForm(false); load(); }} />
      )}

      <div className="filters-row" role="search">
        <input
          type="search"
          placeholder="Pesquisar por título, descrição ou tema..."
          defaultValue={q}
          onKeyDown={(e) => { if (e.key === 'Enter') updateParam('q', e.currentTarget.value); }}
          onBlur={(e) => updateParam('q', e.currentTarget.value)}
          aria-label="Pesquisar materiais"
        />
        <select value={subject} onChange={(e) => updateParam('subject', e.target.value)} aria-label="Filtrar por assunto">
          <option value="">Todos os assuntos</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={type} onChange={(e) => updateParam('type', e.target.value)} aria-label="Filtrar por tipo">
          <option value="">Todos os tipos</option>
          <option value="video">Vídeo</option>
          <option value="texto">Texto</option>
          <option value="atividade">Atividade</option>
        </select>
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {loading && <div className="loading-state">Carregando materiais...</div>}

      {!loading && resources.length === 0 && (
        <div className="empty-state">Nenhum material encontrado com esses filtros.</div>
      )}

      <div className="grid-3">
        {resources.map((r) => (
          <div key={r.id} className="card resource-card">
            <span className="resource-type-icon">{typeIcon[r.type]}</span>
            <span className="badge">{typeLabel[r.type]}{r.subject ? ` · ${r.subject}` : ''}</span>
            <h3 style={{ margin: '4px 0' }}>{r.title}</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{r.description}</p>
            <div className="resource-actions">
              <Link to={`/biblioteca/${r.id}`} className="btn btn-sm btn-primary">Abrir</Link>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => toggleFavorite(r.id)}
                aria-pressed={favoriteIds.has(r.id)}
              >
                {favoriteIds.has(r.id) ? '★ Favorito' : '☆ Favoritar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewResourceForm({ onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', content: '', type: 'texto', subject: '', tags: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.createResource(form);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={onSubmit} style={{ marginBottom: 24 }}>
      <h3>Novo material</h3>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="grid-2">
        <div className="field">
          <label htmlFor="title">Título</label>
          <input id="title" name="title" required value={form.title} onChange={onChange} />
        </div>
        <div className="field">
          <label htmlFor="type">Tipo</label>
          <select id="type" name="type" value={form.type} onChange={onChange}>
            <option value="texto">Texto</option>
            <option value="video">Vídeo</option>
            <option value="atividade">Atividade</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="subject">Assunto</label>
          <input id="subject" name="subject" value={form.subject} onChange={onChange} placeholder="Ex: Matemática" />
        </div>
        <div className="field">
          <label htmlFor="tags">Tags (separadas por vírgula)</label>
          <input id="tags" name="tags" value={form.tags} onChange={onChange} placeholder="Ex: frações, básico" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="description">Descrição curta</label>
        <input id="description" name="description" value={form.description} onChange={onChange} />
      </div>
      <div className="field">
        <label htmlFor="content">
          Conteúdo {form.type === 'video' ? '(URL do vídeo, ex: embed do YouTube)' : ''}
        </label>
        <textarea id="content" name="content" rows={4} value={form.content} onChange={onChange} />
      </div>
      <button className="btn btn-accent" disabled={saving}>{saving ? 'Publicando...' : 'Publicar material'}</button>
    </form>
  );
}
