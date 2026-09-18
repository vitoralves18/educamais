import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';

export default function ResourceViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { speakForce } = useAccessibility();

  const [resource, setResource] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [neighbors, setNeighbors] = useState({ prevId: null, nextId: null });

  useEffect(() => {
    setSelected(null);
    setChecked(false);
    api.getResource(id).then((d) => setResource(d.resource)).catch((err) => setError(err.message));

    api.listResources().then((d) => {
      const ids = d.resources.map((r) => r.id);
      const idx = ids.indexOf(Number(id));
      setNeighbors({
        prevId: idx > 0 ? ids[idx - 1] : null,
        nextId: idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null,
      });
    }).catch(() => {});
  }, [id]);

  if (error) return <div className="error-banner" role="alert">{error}</div>;
  if (!resource) return <div className="loading-state">Carregando material...</div>;

  const readAloud = () => {
    let text = `${resource.title}. ${resource.description}. `;
    if (resource.type === 'atividade') {
      try {
        const parsed = JSON.parse(resource.content);
        text += `${parsed.questao} Alternativas: ${parsed.alternativas.map((a, i) => `${i + 1}. ${a}`).join('. ')}`;
      } catch (_) {
        text += resource.content;
      }
    } else if (resource.type === 'texto') {
      text += resource.content;
    }
    speakForce(text);
  };

  return (
    <div className="resource-viewer">
      <Link to="/biblioteca" style={{ color: 'var(--color-muted)', fontWeight: 700, textDecoration: 'none' }}>← Voltar à biblioteca</Link>

      <div className="question-box" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <span className="badge">{resource.type === 'atividade' ? 'Atividade' : resource.type === 'video' ? 'Vídeo' : 'Texto'}</span>
            <h2 style={{ marginTop: 8 }}>{resource.title}</h2>
          </div>
          <button className="speak-btn" onClick={readAloud} aria-label="Ler em voz alta" title="Ler em voz alta">🔊</button>
        </div>

        {resource.description && <p style={{ color: 'var(--color-muted)' }}>{resource.description}</p>}

        {resource.type === 'video' && (
          <div style={{ aspectRatio: '16/9', marginTop: 16 }}>
            <iframe
              src={resource.content}
              title={resource.title}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: 12 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {resource.type === 'texto' && (
          <p style={{ fontSize: '1.05rem', marginTop: 16 }}>{resource.content}</p>
        )}

        {resource.type === 'atividade' && <ActivityQuestion content={resource.content} selected={selected} setSelected={setSelected} checked={checked} setChecked={setChecked} />}
      </div>

      <div className="viewer-nav">
        <button className="btn btn-outline" disabled={!neighbors.prevId} onClick={() => navigate(`/biblioteca/${neighbors.prevId}`)}>‹ Anterior</button>
        <button className="btn btn-outline" disabled={!neighbors.nextId} onClick={() => navigate(`/biblioteca/${neighbors.nextId}`)}>Próxima ›</button>
      </div>
    </div>
  );
}

function ActivityQuestion({ content, selected, setSelected, checked, setChecked }) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (_) {
    return <p>{content}</p>;
  }

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontWeight: 700 }}>{parsed.questao}</p>
      {parsed.alternativas.map((alt, i) => {
        let cls = 'alt-option';
        if (checked && i === parsed.resposta) cls += ' correct';
        else if (checked && i === selected && i !== parsed.resposta) cls += ' incorrect';
        else if (!checked && i === selected) cls += ' selected';

        return (
          <div key={i} className={cls} onClick={() => !checked && setSelected(i)} role="radio" aria-checked={selected === i} tabIndex={0}
            onKeyDown={(e) => { if (!checked && (e.key === 'Enter' || e.key === ' ')) setSelected(i); }}>
            <strong>{String.fromCharCode(65 + i)})</strong> {alt}
          </div>
        );
      })}
      <button className="btn btn-accent" disabled={selected === null || checked} onClick={() => setChecked(true)}>
        Verificar resposta
      </button>
      {checked && (
        <p style={{ marginTop: 12, fontWeight: 700, color: selected === parsed.resposta ? 'var(--color-accent-green)' : 'var(--color-danger)' }}>
          {selected === parsed.resposta ? 'Resposta correta! 🎉' : 'Não foi dessa vez. Tente revisar o texto novamente.'}
        </p>
      )}
    </div>
  );
}
