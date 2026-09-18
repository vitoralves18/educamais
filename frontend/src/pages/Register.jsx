import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import HandsArt from '../components/HandsArt';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: params.get('role') || 'aluno',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PublicHeader />
      <div className="hero-split" id="main-content">
        <aside className="hero-panel">
          <h2 className="hero-panel-title">Registrar</h2>
          <form onSubmit={onSubmit}>
            {error && <div className="error-banner" role="alert">{error}</div>}
            <div className="field">
              <label htmlFor="name">Nome</label>
              <input id="name" name="name" required value={form.name} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="role">Eu sou</label>
              <select id="role" name="role" value={form.role} onChange={onChange}>
                <option value="aluno">Aluno</option>
                <option value="tutor">Professor / Tutor</option>
                <option value="responsavel">Responsável</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="email">Login (email)</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="password">Senha</label>
              <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={onChange} />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Criando conta...' : 'ENTRAR'}
            </button>
          </form>
          <Link to="/entrar" className="btn btn-outline btn-block">JÁ TENHO CONTA</Link>
        </aside>

        <section className="hero-illustration">
          <HandsArt />
        </section>
      </div>
    </div>
  );
}
