import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Progress() {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState(user.role === 'aluno' ? String(user.id) : '');
  const [evaluations, setEvaluations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) return;
    setError('');
    api.getStudentEvaluations(studentId)
      .then((d) => setEvaluations(d.evaluations))
      .catch((err) => setError(err.message));
  }, [studentId]);

  return (
    <div>
      <h1>{user.role === 'aluno' ? 'Meu progresso' : 'Progresso familiar'}</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        {user.role === 'aluno'
          ? 'Veja as avaliações registradas pelo seu tutor.'
          : 'Acompanhe as avaliações e observações registradas pelos tutores para o aluno sob sua responsabilidade.'}
      </p>

      {user.role === 'responsavel' && (
        <div className="field" style={{ maxWidth: 340 }}>
          <label htmlFor="studentId">ID do aluno acompanhado</label>
          <StudentPicker initial={studentId} onSelect={setStudentId} />
          <p className="field-hint">
            Peça ao aluno ou ao tutor o identificador do aluno (visível no fórum/biblioteca) para acompanhar o progresso.
          </p>
        </div>
      )}

      {error && <div className="error-banner" role="alert">{error}</div>}

      {studentId && !error && evaluations.length === 0 && (
        <div className="empty-state">Nenhuma avaliação registrada ainda.</div>
      )}

      <div className="grid-2">
        {evaluations.map((e) => (
          <div key={e.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="badge">{e.progress}% de progresso</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{e.created_at}</span>
            </div>
            <p style={{ marginTop: 10 }}>{e.note}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Tutor: {e.tutor_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentPicker({ initial, onSelect }) {
  const [value, setValue] = useState(initial || '');
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        placeholder="ID do aluno (ex: 1)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="button" className="btn btn-sm btn-primary" onClick={() => onSelect(value)}>Buscar</button>
    </div>
  );
}
