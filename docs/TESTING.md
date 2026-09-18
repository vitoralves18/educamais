# Testes — EducaMais+

## 1. Testes automatizados

### Backend (16 testes — Node Test Runner + Supertest)

```bash
cd backend
npm install
npm test
```

Cobertura: registro/login (sucesso e falhas), rota protegida sem token, atualização de
perfil/acessibilidade, RBAC (aluno não publica material, tutor publica), notificação
automática ao publicar material, pesquisa avançada, favoritos, fluxo completo do fórum
(criação de canal + mensagens), validação de mensagem vazia, avaliação de aluno pelo
tutor e bloqueio de acesso de outro aluno às avaliações alheias, healthcheck.

Os testes rodam contra um banco **em memória** (`DB_PATH=:memory:`), então não afetam o
banco de desenvolvimento (`educamais.db`).

### Frontend (11 testes — Vitest + Testing Library)

```bash
cd frontend
npm install
npm test
```

Cobertura: menu de acessibilidade (fonte, contraste, leitor de tela e persistência em
`localStorage`), validação do formulário de registro (senhas não coincidem, erro vindo da
API, rótulos acessíveis em todos os campos), tela de login (mensagem de erro, estado de
carregamento), e proteção de rotas (redirecionamento para `/entrar` sem sessão).

### Rodando tudo de uma vez

```bash
(cd backend && npm test) && (cd frontend && npm test)
```

## 2. Testes manuais de integração já validados

Durante o desenvolvimento, validamos manualmente (via `curl`) o fluxo ponta a ponta:
cadastro → login (3 papéis) → tutor avalia aluno → responsável e aluno consultam o
progresso → aluno favorita e visualiza histórico → mensagens no fórum → tentativa de
acesso indevido bloqueada (403). Todos os cenários passaram.

## 3. Roteiro de teste de usabilidade (para aplicar com pessoas reais)

Recomendamos aplicar este roteiro com pelo menos 3–5 pessoas (colegas, professores ou
familiares), idealmente incluindo alguém que use leitor de tela ou tenha baixa visão, já
que o tema do projeto é acessibilidade.

### Tarefas propostas

1. Crie uma conta como **Aluno**.
2. Ative o **alto contraste** e o **tamanho de fonte grande** pelo menu de acessibilidade.
3. Encontre um material sobre "frações" na Biblioteca usando a pesquisa.
4. Abra uma atividade, responda a questão e veja o resultado.
5. Favorite um material.
6. Envie uma mensagem no Fórum.
7. Ative o **leitor de tela** e ouça o conteúdo de um material.
8. Saia da conta e entre como **Tutor** (conta de teste) para publicar um novo material.
9. Volte como Aluno e verifique se a notificação do novo material chegou.

### O que observar durante o teste

- A pessoa conseguiu concluir a tarefa sem ajuda? Quanto tempo levou?
- Ela hesitou ou clicou no lugar errado em algum momento? Onde?
- Os rótulos e textos dos botões fizeram sentido pra ela?
- O feedback do sistema (mensagens de erro/sucesso) foi claro?
- Alguma barreira de acessibilidade percebida (contraste, tamanho de clique, navegação
  por teclado, leitor de tela)?

### Questionário pós-teste (System Usability Scale simplificado)

Peça para a pessoa responder de 1 (discordo totalmente) a 5 (concordo totalmente):

1. Eu me senti confiante usando esta aplicação.
2. Achei a navegação fácil de entender.
3. As ferramentas de acessibilidade foram fáceis de encontrar e usar.
4. Eu usaria esta aplicação novamente.
5. Encontrei alguma coisa confusa ou inconsistente (se sim, o quê?).

### Registrando os resultados

Anote os achados de cada testador em uma tabela simples:

| Testador | Tarefa com dificuldade | Sugestão de melhoria | Nota geral (1-5) |
|---|---|---|---|
| Ex: Colega A | Não achou o botão de favoritar | Aumentar contraste do botão | 4 |

Esses achados podem virar o "feedback obtido" citado no item 2 da entrega (refinamento de
interface) — use-os para justificar ajustes futuros e mencione os resultados no vídeo de
demonstração.

## 4. Melhorias de acessibilidade/UX já aplicadas nesta entrega

A partir de uma avaliação heurística própria (sem esperar o teste com usuários), já
implementamos:

- Link "Pular para o conteúdo" (skip-link) em todas as páginas.
- `role="alert"` / `role="status"` em mensagens de erro/sucesso, para leitura automática
  por leitores de tela.
- Menu de acessibilidade agora fecha com `Esc` e recebe foco automático ao abrir.
- Navegação responsiva (menu hambúrguer) para telas pequenas.
- Página 404 amigável em vez de redirecionamento silencioso.
- Error Boundary global, evitando tela branca em caso de erro inesperado.
