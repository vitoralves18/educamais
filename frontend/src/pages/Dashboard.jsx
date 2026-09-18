import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const cardsByRole = {
  aluno: [
    { to: '/biblioteca', icon: '📚', tag: 'Meus Materiais', desc: 'Veja vídeos, textos e atividades adaptadas para você.' },
    { to: '/perfil', icon: '🧩', tag: 'Necessidades', desc: 'Conte suas preferências e necessidades específicas.' },
    { to: '/forum', icon: '💬', tag: 'Fórum', desc: 'Converse com colegas e professores.' },
    { to: '/progresso', icon: '📈', tag: 'Meu progresso', desc: 'Acompanhe as avaliações feitas pelo seu tutor.' },
  ],
  tutor: [
    { to: '/biblioteca?novo=1', icon: '📤', tag: 'Disponibilizar material', desc: 'Publique vídeos, textos e atividades para os alunos.' },
    { to: '/avaliar', icon: '📝', tag: 'Avaliar Aluno', desc: 'Registre o progresso e observações de cada aluno.' },
    { to: '/forum', icon: '💬', tag: 'Fórum', desc: 'Tire dúvidas e apoie a comunidade.' },
    { to: '/biblioteca', icon: '📚', tag: 'Biblioteca', desc: 'Veja todos os materiais já publicados.' },
  ],
  responsavel: [
    { to: '/progresso', icon: '📈', tag: 'Progresso familiar', desc: 'Acompanhe a evolução do seu filho(a).' },
    { to: '/biblioteca', icon: '💡', tag: 'Sugestões', desc: 'Descubra materiais recomendados para casa.' },
    { to: '/forum', icon: '💬', tag: 'Fórum', desc: 'Converse com professores e outros responsáveis.' },
    { to: '/perfil', icon: '⚙️', tag: 'Preferências', desc: 'Ajuste as ferramentas de acessibilidade da conta.' },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const cards = cardsByRole[user?.role] || [];

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Olá, {user?.name?.split(' ')[0]}!</h1>
          <p style={{ color: 'var(--color-muted)' }}>
            {user?.role === 'aluno' && (
              <>Continue de onde parou ou explore novos materiais. Seu ID de acompanhamento é <strong>{user.id}</strong> — compartilhe com seu responsável.</>
            )}
            {user?.role === 'tutor' && 'Gerencie os materiais da turma e acompanhe seus alunos.'}
            {user?.role === 'responsavel' && 'Veja como está o progresso e as novidades da turma.'}
          </p>
        </div>
      </div>

      <div className="grid-2">
        {cards.map((c) => (
          <Link to={c.to} key={c.tag} className="dashboard-card">
            <div className="dashboard-illustration">{c.icon}</div>
            <span className="tag">{c.tag}</span>
            <p style={{ margin: 0, color: 'var(--color-muted)' }}>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
