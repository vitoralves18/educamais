# Guia de Deploy — EducaMais+

Este guia assume que o projeto já está em um repositório no GitHub (veja o passo 0).
Tudo aqui usa **camadas gratuitas**.

## Passo 0 — Subir o projeto pro GitHub

```bash
cd educamais
git init
git add .
git commit -m "EducaMais+ - versão inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/educamais.git
git push -u origin main
```

## Passo 1 — Backend no Render

1. Crie uma conta em [render.com](https://render.com) (dá pra logar com GitHub).
2. Clique em **New +** → **Blueprint**.
3. Selecione o repositório `educamais`. O Render vai detectar o arquivo `render.yaml`
   automaticamente (ele já está configurado para: pasta `backend`, `npm install`,
   `npm run render-start`, healthcheck em `/api/health`).
4. Antes de confirmar, o Render vai pedir o valor da variável `FRONTEND_URL` — deixe em
   branco por enquanto (vamos preencher depois de publicar o frontend). A variável
   `JWT_SECRET` já é gerada automaticamente.
5. Clique em **Apply**. Aguarde o build e o deploy (alguns minutos).
6. Quando terminar, copie a URL gerada, algo como `https://educamais-api.onrender.com`.
7. Teste no navegador: `https://educamais-api.onrender.com/api/health` deve responder
   `{"status":"ok", ...}`.

> **Sobre persistência do banco:** o plano gratuito do Render usa disco efêmero — o
> arquivo SQLite pode ser reiniciado quando a instância reinicia/dorme por inatividade.
> Para uma demonstração/entrega acadêmica isso não é um problema (o `seed.js` roda de
> novo a cada start e é idempotente). Para produção real, considere o plano com
> **Persistent Disk** do Render ou migrar para um banco gerenciado (ex.: Render Postgres,
> que também tem camada gratuita).

## Passo 2 — Frontend no Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) (dá pra logar com GitHub).
2. Clique em **Add New** → **Project** e importe o repositório `educamais`.
3. Em **Root Directory**, selecione `frontend` (importante — o projeto é um monorepo).
4. O Vercel detecta automaticamente que é um projeto Vite (`build`: `npm run build`,
   `output`: `dist`). Não precisa mudar nada aqui.
5. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = `https://educamais-api.onrender.com/api` (a URL do Passo 1 + `/api`)
6. Clique em **Deploy**. Em ~1 minuto você terá uma URL como
   `https://educamais.vercel.app`.

## Passo 3 — Conectar o backend ao domínio do frontend (CORS)

1. Volte ao painel do Render → seu serviço → **Environment**.
2. Edite a variável `FRONTEND_URL` e cole a URL do Vercel (ex.:
   `https://educamais.vercel.app`). Se tiver mais de um domínio (ex.: preview URLs),
   separe por vírgula.
3. Salve — o Render reinicia o serviço automaticamente com a nova variável.

## Passo 4 — GitHub Pages (diagramas e documentação)

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em **Source**, selecione **Deploy from a branch**.
3. Em **Branch**, selecione `main` e a pasta **`/docs`**. Salve.
4. Em ~1 minuto, a página estará em `https://SEU-USUARIO.github.io/educamais/`.
5. Edite `docs/index.html` e atualize os links `#live-app-link` (URL do Vercel) e
   `#repo-link` (URL do repositório) — procure por `id="live-app-link"` no arquivo.

## Checklist final

- [ ] `https://educamais-api.onrender.com/api/health` responde OK
- [ ] `https://educamais.vercel.app` carrega e o login funciona (prova que o CORS e a
      variável `VITE_API_URL` estão corretos)
- [ ] `https://SEU-USUARIO.github.io/educamais/` mostra a página com os diagramas
- [ ] Links da página do GitHub Pages atualizados com as URLs reais

## Solução de problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Frontend carrega mas login dá erro de rede | `VITE_API_URL` errada ou backend dormindo (plano free do Render "hiberna" após inatividade — a 1ª requisição pode demorar ~30s) | Confirme a URL; aguarde o "cold start" |
| Erro de CORS no console do navegador | `FRONTEND_URL` não configurada ou incorreta no Render | Revisar Passo 3 |
| Dados somem depois de um tempo | Disco efêmero do Render (free tier) | Ver nota no Passo 1 |
