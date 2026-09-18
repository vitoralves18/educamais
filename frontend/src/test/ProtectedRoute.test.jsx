import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function Private() { return <div>Área restrita</div>; }
function LoginStub() { return <div>Tela de login</div>; }

function renderWithRoute(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/entrar" element={<LoginStub />} />
          <Route path="/dashboard" element={<ProtectedRoute><Private /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => localStorage.clear());

  it('redireciona para /entrar quando não há usuário logado', async () => {
    renderWithRoute('/dashboard');
    expect(await screen.findByText('Tela de login')).toBeInTheDocument();
  });

  it('mostra o conteúdo protegido quando há sessão válida no localStorage', async () => {
    localStorage.setItem('educamais_token', 'fake-token');
    localStorage.setItem('educamais_user', JSON.stringify({ id: 1, name: 'Ana', role: 'aluno' }));
    renderWithRoute('/dashboard');
    expect(await screen.findByText('Área restrita')).toBeInTheDocument();
  });
});
