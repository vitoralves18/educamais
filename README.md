# EducaMais+ — Plataforma de Educação Inclusiva

Aplicação web completa (frontend + backend + banco de dados), com testes automatizados,
refinamentos de acessibilidade/UX e configuração de deploy — Entregas 6 e 7.

## Stack utilizada

- **Frontend:** React 19 + Vite + React Router
- **Backend:** Node.js + Express
- **Banco de dados:** SQLite (módulo nativo `node:sqlite` do Node.js 22+, sem dependências
  binárias externas — zero configuração)
- **Autenticação:** JWT + bcrypt
- **Testes:** Node Test Runner + Supertest (backend) · Vitest + Testing Library (frontend)
- **Deploy:** Render (backend) + Vercel (frontend) + GitHub Pages (documentação)

## Funcionalidades implementadas (conforme especificação)

1. **Autenticação de usuários** — cadastro e login para aluno, tutor e responsável (`/api/auth`)
2. **Perfil personalizado** — necessidades específicas, bio (`/api/profile`)
3. **Biblioteca de recursos** — vídeos, textos e atividades interativas (`/api/resources`)
4. **Ferramentas de acessibilidade** — leitor de tela (Web Speech API), ajuste de
   contraste e de tamanho de fonte, persistidos por usuário
5. **Comunidade e suporte** — fórum com canais e mensagens (`/api/forum`)
6. **Notificações** — novo material publicado, nova avaliação de progresso (`/api/notifications`)
7. **Pesquisa avançada** — filtro por texto, assunto e tipo de material
8. **Integração externa** — pontos de extensão prontos (ex.: embed de vídeo do YouTube na
   biblioteca); a arquitetura de API REST facilita integrações futuras com redes sociais/
   serviços externos

Extras: avaliação/progresso do aluno (tutor avalia → aluno e responsável acompanham),
favoritos e histórico de materiais visualizados.

## Estrutura do projeto

```
educamais/
├── backend/         API REST (Express + SQLite)
│   ├── routes/        auth, profile, resources, favorites, forum, notifications, evaluations
│   ├── middleware/    autenticação JWT
│   ├── test/           testes automatizados (node:test + supertest)
│   ├── db.js            schema do banco
│   ├── seed.js           dados de exemplo (contas de teste, idempotente)
│   ├── Dockerfile         alternativa de deploy via container
│   └── render.yaml       (na raiz) blueprint de deploy no Render
├── frontend/        SPA em React (Vite)
│   └── src/
│       ├── api/          cliente HTTP central
│       ├── context/       Auth e Acessibilidade (React Context)
│       ├── components/   Header, menu de acessibilidade, layout, ErrorBoundary etc.
│       ├── pages/          Home, Login, Registrar, Dashboard, Biblioteca, Fórum, Perfil...
│       └── test/            testes de componente (Vitest + Testing Library)
├── docs/             página do GitHub Pages + documentação completa
└── render.yaml       blueprint de deploy do backend no Render
```

## Como rodar localmente

### 1. Backend

```bash
cd backend
npm install
npm run seed     # cria o banco e contas de teste (idempotente, pode rodar de novo)
npm start        # inicia a API em http://localhost:4000
```

> Requer **Node.js 22 ou superior** (usa o módulo nativo `node:sqlite`).

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev      # inicia em http://localhost:5173
```

O frontend já está configurado (`.env`) para consumir a API em `http://localhost:4000/api`.

### Contas de teste (senha para todas: `123456`)

| Papel        | Email                       |
|--------------|------------------------------|
| Aluno        | alunox@educamais.com         |
| Tutor        | tutor@educamais.com          |
| Responsável  | responsavel@educamais.com    |

## Testes automatizados

```bash
cd backend && npm install && npm test   # 16 testes (Node Test Runner + Supertest)
cd frontend && npm install && npm test  # 11 testes (Vitest + Testing Library)
```

Cobertura completa e o roteiro de teste de usabilidade (para aplicar com pessoas reais)
estão em [`docs/TESTING.md`](docs/TESTING.md).

## Documentação completa

| Documento | Conteúdo |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Decisões técnicas, diagrama e estrutura de pastas |
| [`docs/API.md`](docs/API.md) | Referência de todos os endpoints da API |
| [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) | Como usar a plataforma em cada papel |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Passo a passo de hospedagem (Render + Vercel + GitHub Pages) |
| [`docs/TESTING.md`](docs/TESTING.md) | Testes automatizados e roteiro de teste de usabilidade |
| [`docs/index.html`](docs/index.html) | Página do GitHub Pages com diagramas (abrir no navegador) |

## Hospedagem

- **Backend:** preparado para [Render](https://render.com) — `render.yaml` na raiz
  (deploy via Blueprint), mais `backend/Dockerfile` como alternativa genérica.
- **Frontend:** preparado para [Vercel](https://vercel.com) — `frontend/vercel.json` com
  rewrite para SPA (React Router).
- Passo a passo completo (contas, variáveis de ambiente, checklist) em
  [`docs/DEPLOY.md`](docs/DEPLOY.md).

## GitHub Pages

A pasta `docs/` contém `index.html`, uma página estática com os diagramas de arquitetura
e do banco de dados (Mermaid.js) e a visão geral do projeto — pronta para ser publicada em
**Settings → Pages → Branch: main → pasta `/docs`**.

## Refinamentos de UX/acessibilidade aplicados

- Link "Pular para o conteúdo" (skip-link) em todas as páginas
- `role="alert"`/`role="status"` nas mensagens de erro/sucesso (leitura automática por leitor de tela)
- Menu de acessibilidade com suporte a `Esc` e foco automático
- Navegação responsiva (menu hambúrguer) para telas pequenas
- Página 404 amigável
- Error Boundary global (evita tela branca em erros inesperados)

Detalhes e o roteiro de teste de usabilidade em [`docs/TESTING.md`](docs/TESTING.md).

## Erros encontrados e corrigidos durante o desenvolvimento

- Dependência nativa `better-sqlite3` não compilava no ambiente de desenvolvimento (sem
  acesso aos headers do Node) → substituída pelo módulo nativo `node:sqlite`.
- Sintaxe de substring do bash (`${VAR:0:20}`) incompatível com `/bin/sh` nos scripts de
  teste manuais → ajustada para sintaxe portátil.
- `node --test test` (sem barra) era interpretado como `require('test')` → corrigido para
  `node --test` (auto-descoberta de arquivos `*.test.js`).

## Roteiro sugerido para o vídeo de demonstração (até 10 min) — Entrega 7

1. **(1 min)** Contexto rápido do projeto e o que muda nesta entrega: testes, refino de
   UX, hospedagem e página de documentação.
2. **(2 min)** Testes automatizados: rodar `npm test` no backend e no frontend ao vivo,
   mostrando os testes passando (prova de que auth, RBAC, fórum, notificações etc. funcionam).
3. **(2 min)** Melhorias de interface: mostrar o skip-link (`Tab` na primeira tela), o
   menu de navegação mobile (redimensionar a janela), o menu de acessibilidade fechando
   com `Esc`, e a página 404.
4. **(2 min)** Aplicação hospedada: abrir a URL pública (Vercel), fazer login, navegar
   pela biblioteca e pelo fórum — mostrando que frontend e backend publicados conversam
   entre si.
5. **(1 min)** Mostrar a página do GitHub Pages com os diagramas de arquitetura e banco
   de dados.
6. **(1 min)** Resumo de 1-2 achados do teste de usabilidade aplicado com colegas/família
   e a melhoria feita a partir disso.
7. **(1 min)** Encerramento: repositório, documentação e link da aplicação.

## Observações

- Banco de dados SQLite é um arquivo local (`backend/educamais.db`), criado automaticamente
  na primeira execução — ideal para desenvolvimento e demonstração, sem necessidade de
  serviço externo. Ver limitações de persistência em produção em `docs/DEPLOY.md`.
- Para produção, o `JWT_SECRET` é gerado automaticamente pelo Render (`render.yaml`); em
  outros ambientes, defina-o manualmente como variável de ambiente segura.
