import { Link, useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import HandsArt from '../components/HandsArt';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleForumClick = () => {
    navigate(user ? '/forum' : '/entrar');
  };

  return (
    <div>
      <PublicHeader />
      <div className="hero-split" id="main-content">
        <aside className="hero-panel">
          <h2 className="hero-panel-title">Educação inclusiva, ao alcance de todos</h2>
          <p>
            Materiais adaptados, ferramentas de acessibilidade e uma comunidade que apoia
            estudantes com necessidades especiais.
          </p>
          <Link to="/entrar" className="btn btn-primary">ENTRAR</Link>
          <Link to="/registrar" className="btn btn-outline">REGISTRAR</Link>
        </aside>

        <section className="hero-illustration">
          <HandsArt />
          <h1 style={{ fontSize: '1.6rem' }}>EducaMais+</h1>
          <p style={{ maxWidth: 420, color: 'var(--color-muted)' }}>
            Uma plataforma que centraliza recursos educativos adaptados para estudantes,
            professores e responsáveis.
          </p>
          <button onClick={handleForumClick} className="link-forum forum-cta">
            FÓRUM →
          </button>
        </section>
      </div>
    </div>
  );
}
