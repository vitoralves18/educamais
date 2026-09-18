import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function EvaluateStudents() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [note, setNote] = useState('');
  const [progress, setProgress] = useState(50);
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listStudents().then((d) => {
      setStudents(d.students);
      if (d.students.length) setStudentId(String(d.students[0].id));
    });
  }, []);

  useEffect(() => {
    if (studentId) {
      api.getStudentEvaluations(studentId).then((d) => setHistory(d.evaluations));
    }
  }, [studentId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    if (!note.trim()) {
      setError('Escreva uma observação sobre o progresso do aluno.');
      return;
    }
    try {
      await api.createEvaluation({ student_id: Number(studentId), note, progress: Number(progress) });
      setNote('');
      setSaved(true);
      const d = await api.getStudentEvaluations(studentId);
      setHistory(d.evaluations);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Avaliar aluno</h1>
      <p style={{ color: 'var(--color-muted)' }}>Registre observações e o progresso de cada aluno.</p>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        <form className="card" onSubmit={submit}>
          {error && <div className="error-banner" role="alert">{error}</div>}
          {saved && <div className="success-banner" role="status">Avaliação registrada! O aluno foi notificado.</div>}

          <div className="field">
            <label htmlFor="student">Aluno</label>
            <select id="student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="progress">Progresso ({progress}%)</label>
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="note">Observação</label>
            <textarea id="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: Demonstrou boa evolução na leitura, ainda precisa de apoio em matemática." />
          </div>

          <button className="btn btn-accent" type="submit">Registrar avaliação</button>
        </form>

        <div className="card">
          <h3>Histórico</h3>
          {history.length === 0 && <p style={{ color: 'var(--color-muted)' }}>Nenhuma avaliação registrada ainda para este aluno.</p>}
          {history.map((h) => (
            <div key={h.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0' }}>
              <strong>{h.progress}% de progresso</strong>
              <p style={{ margin: '4px 0', color: 'var(--color-muted)' }}>{h.note}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{h.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
