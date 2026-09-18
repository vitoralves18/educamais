import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Register from '../pages/Register';

vi.mock('../api/client', () => ({
  api: {
    register: vi.fn(),
    login: vi.fn(),
  },
}));

import { api } from '../api/client';

function renderRegister() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Register (validação de usabilidade do formulário)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('mostra erro quando as senhas não coincidem, sem chamar a API', () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByLabelText('Login (email)'), { target: { value: 'maria@teste.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirmar Senha'), { target: { value: 'diferente' } });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it('exibe a mensagem de erro vinda da API (ex: email duplicado)', async () => {
    api.register.mockRejectedValueOnce(new Error('Já existe uma conta com este email.'));
    renderRegister();

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByLabelText('Login (email)'), { target: { value: 'maria@teste.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirmar Senha'), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Já existe uma conta com este email.')).toBeInTheDocument();
  });

  it('todos os campos possuem rótulos associados (acessibilidade)', () => {
    renderRegister();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Login (email)')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Eu sou')).toBeInTheDocument();
  });
});
