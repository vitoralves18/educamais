import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Profile() {
  const { fontSize, setFontSize, highContrast, setHighContrast, screenReader, setScreenReader } = useAccessibility();
  const [profile, setProfile] = useState(null);
  const [necessidades, setNecessidades] = useState('');
  const [bio, setBio] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getProfile().then((d) => {
      setProfile(d.profile);
      setNecessidades(d.profile.necessidades || '');
      setBio(d.profile.bio || '');
    }).catch((err) => setError(err.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await api.updateProfile({
        necessidades,
        bio,
        font_size: fontSize,
        high_contrast: highContrast,
        screen_reader: screenReader,
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!profile) return <div className="loading-state">Carregando perfil...</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <h1>Meu perfil</h1>
      <p style={{ color: 'var(--color-muted)' }}>{profile.name} · {profile.email}</p>

      <form onSubmit={save} className="card" style={{ marginTop: 20 }}>
        {error && <div className="error-banner" role="alert">{error}</div>}
        {saved && <div className="success-banner" role="status">Preferências salvas com sucesso!</div>}

        <div className="field">
          <label htmlFor="necessidades">Necessidades específicas</label>
          <textarea
            id="necessidades"
            rows={3}
            value={necessidades}
            onChange={(e) => setNecessidades(e.target.value)}
            placeholder="Ex: baixa visão, dislexia, TDAH..."
          />
          <p className="field-hint">Isso ajuda os tutores a adaptar melhor os materiais para você.</p>
        </div>

        <div className="field">
          <label htmlFor="bio">Sobre mim</label>
          <textarea id="bio" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <h3 style={{ marginTop: 24 }}>Ferramentas de acessibilidade</h3>

        <div className="field">
          <label>Tamanho da fonte</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['small', 'medium', 'large'].map((s) => (
              <button
                type="button"
                key={s}
                className={`btn btn-sm ${fontSize === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFontSize(s)}
              >
                {s === 'small' ? 'Pequena' : s === 'medium' ? 'Média' : 'Grande'}
              </button>
            ))}
          </div>
        </div>

        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            id="contrast"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            style={{ width: 'auto' }}
          />
          <label htmlFor="contrast" style={{ margin: 0 }}>Ativar alto contraste</label>
        </div>

        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            id="reader"
            checked={screenReader}
            onChange={(e) => setScreenReader(e.target.checked)}
            style={{ width: 'auto' }}
          />
          <label htmlFor="reader" style={{ margin: 0 }}>Ativar leitor de tela (botão 🔊 nos materiais)</label>
        </div>

        <button className="btn btn-accent" type="submit">Salvar preferências</button>
      </form>
    </div>
  );
}
