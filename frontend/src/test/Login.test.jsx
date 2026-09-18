import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

vi.mock('../api/client', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

import { api } from '../api/client';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('exibe erro amigável quando o login falha', async () => {
    api.login.mockRejectedValueOnce(new Error('Email ou senha inválidos.'));
    renderLogin();

    fireEvent.change(screen.getByLabelText('Login (email)'), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'errada' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Email ou senha inválidos.')).toBeInTheDocument();
  });

  it('desabilita o botão enquanto a requisição está em andamento', async () => {
    let resolveLogin;
    api.login.mockReturnValueOnce(new Promise((resolve) => { resolveLogin = resolve; }));
    renderLogin();

    fireEvent.change(screen.getByLabelText('Login (email)'), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
    resolveLogin({ token: 't', user: { id: 1, name: 'Teste', role: 'aluno' } });
  });
});
