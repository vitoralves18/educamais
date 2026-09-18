import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';

export default function NotFound() {
  return (
    <div>
      <PublicHeader />
      <div className="empty-state" style={{ padding: '80px 20px' }}>
        <h1 style={{ fontSize: '2.4rem' }}>404</h1>
        <p>Essa página não existe ou foi movida.</p>
        <Link to="/" className="btn btn-primary">Voltar para o início</Link>
      </div>
    </div>
  );
}
