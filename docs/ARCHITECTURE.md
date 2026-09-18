# Arquitetura — EducaMais+

## Visão geral

O EducaMais+ é uma SPA (Single Page Application) em React que consome uma API REST
em Node.js/Express, que por sua vez persiste os dados em um banco SQLite.

```
┌─────────────────────┐        HTTPS / JSON        ┌──────────────────────┐
│   Frontend (React)   │ ─────────────────────────► │   Backend (Express)   │
│   Vite + Router       │ ◄───────────────────────── │   JWT + RBAC           │
│   hospedado no Vercel │                             │   hospedado no Render  │
└─────────────────────┘                             └──────────┬───────────┘
                                                                  │
                                                                  ▼
                                                        ┌──────────────────┐
                                                        │  SQLite (arquivo)  │
                                                        │  node:sqlite       │
                                                        └──────────────────┘
```

O diagrama interativo (Mermaid) está disponível em [`docs/index.html`](index.html)
(página do GitHub Pages).

## Por que essas escolhas técnicas

- **SQLite via `node:sqlite` (nativo do Node 22+):** elimina a necessidade de compilar
  dependências binárias (ex: `better-sqlite3`) e de configurar um serviço de banco de
  dados externo — ideal para um projeto acadêmico que precisa rodar em qualquer máquina
  com `npm install`. Trade-off: em produção, plataformas de hospedagem "free tier" podem
  ter disco efêmero (ver `DEPLOY.md`).
- **JWT (stateless):** simplifica a escalabilidade horizontal do backend, já que nenhuma
  sessão precisa ser compartilhada entre instâncias.
- **React Context API (em vez de Redux):** o estado global do app é pequeno (usuário
  autenticado + preferências de acessibilidade), então uma biblioteca de gerenciamento de
  estado mais pesada não se justifica.
- **RBAC simples por papel (`aluno`, `tutor`, `responsavel`):** os middlewares
  `authRequired` e `roleRequired` (`backend/middleware/auth.js`) controlam o acesso às
  rotas sensíveis (ex.: apenas tutores publicam materiais e avaliam alunos).

## Estrutura de pastas

```
educamais/
├── backend/
│   ├── routes/            endpoints da API (auth, profile, resources, forum, ...)
│   ├── middleware/auth.js  autenticação e autorização (JWT + papéis)
│   ├── test/               testes automatizados (node:test + supertest)
│   ├── db.js                conexão e schema do SQLite
│   ├── seed.js               dados de exemplo (idempotente)
│   ├── server.js              app Express (exporta `app` para testes)
│   ├── render.yaml (na raiz)  blueprint de deploy no Render
│   └── Dockerfile             alternativa de deploy via container
├── frontend/
│   └── src/
│       ├── api/client.js       cliente HTTP central (fetch wrapper)
│       ├── context/            AuthContext e AccessibilityContext
│       ├── components/         Header, menu de acessibilidade, layout, etc.
│       ├── pages/               telas da aplicação
│       └── test/                 testes de componente (Vitest + Testing Library)
└── docs/                 página do GitHub Pages + documentação complementar
```

## Fluxo de autenticação

1. Usuário faz login/registro → backend retorna um JWT assinado (`JWT_SECRET`).
2. Frontend guarda o token em `localStorage` (`AuthContext`).
3. Toda chamada autenticada envia `Authorization: Bearer <token>` (`api/client.js`).
4. O middleware `authRequired` valida o token em cada rota protegida; `roleRequired`
   garante que só o papel certo acesse determinadas ações (ex.: publicar material).

## Fluxo de acessibilidade

As preferências de acessibilidade (tamanho de fonte, alto contraste, leitor de tela)
vivem em `AccessibilityContext`, são aplicadas como classes CSS no `<html>` e persistidas
em `localStorage` para uso mesmo antes do login — e também podem ser salvas no perfil do
usuário autenticado (`PUT /api/profile`) para sincronizar entre dispositivos.
