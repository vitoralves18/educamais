import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import HandsArt from '../components/HandsArt';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PublicHeader />
      <div className="hero-split" id="main-content">
        <aside className="hero-panel">
          <h2 className="hero-panel-title">Entrar</h2>
          <form onSubmit={onSubmit}>
            {error && <div className="error-banner" role="alert">{error}</div>}
            <div className="field">
              <label htmlFor="email">Login (email)</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="password">Senha</label>
              <input id="password" name="password" type="password" required value={form.password} onChange={onChange} />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Entrando...' : 'ENTRAR'}
            </button>
          </form>
          <Link to="/registrar" className="btn btn-outline btn-block">REGISTRAR</Link>
          <p className="field-hint">
            Contas de teste: alunox@educamais.com · tutor@educamais.com · responsavel@educamais.com
            (senha: 123456)
          </p>
        </aside>

        <section className="hero-illustration">
          <HandsArt />
        </section>
      </div>
    </div>
  );
}
