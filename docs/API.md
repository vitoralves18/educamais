# Referência da API — EducaMais+

Base URL local: `http://localhost:4000/api`
Base URL produção: `https://SEU-BACKEND.onrender.com/api`

Todas as rotas (exceto `/auth/register`, `/auth/login` e `/health`) exigem o header:
```
Authorization: Bearer <token>
```

## Autenticação

| Método | Rota | Descrição | Papel |
|---|---|---|---|
| POST | `/auth/register` | Cria conta (`name`, `email`, `password`, `confirmPassword`, `role`) | público |
| POST | `/auth/login` | Login (`email`, `password`) | público |
| GET | `/auth/me` | Dados do usuário autenticado | qualquer |

## Perfil

| Método | Rota | Descrição | Papel |
|---|---|---|---|
| GET | `/profile` | Perfil + preferências de acessibilidade | qualquer |
| PUT | `/profile` | Atualiza `necessidades`, `font_size`, `high_contrast`, `screen_reader`, `bio` | qualquer |

## Biblioteca de recursos

| Método | Rota | Descrição | Papel |
|---|---|---|---|
| GET | `/resources?q=&subject=&type=` | Lista/pesquisa materiais | qualquer |
| GET | `/resources/subjects` | Lista de assuntos distintos | qualquer |
| GET | `/resources/:id` | Detalhe de um material (registra histórico) | qualquer |
| POST | `/resources` | Publica material (`title`, `type`, `description`, `content`, `subject`, `tags`) | tutor |
| DELETE | `/resources/:id` | Remove material próprio | tutor (autor) |

## Favoritos e histórico

| Método | Rota | Descrição |
|---|---|---|
| GET | `/favorites` | Lista favoritos do usuário |
| POST | `/favorites/:resourceId` | Favorita um material |
| DELETE | `/favorites/:resourceId` | Remove favorito |
| GET | `/favorites/history/list` | Histórico de materiais visualizados |

## Fórum

| Método | Rota | Descrição |
|---|---|---|
| GET | `/forum/channels` | Lista canais |
| POST | `/forum/channels` | Cria canal (`name`) |
| GET | `/forum/channels/:id/messages` | Lista mensagens do canal |
| POST | `/forum/channels/:id/messages` | Envia mensagem (`content`) |

## Notificações

| Método | Rota | Descrição |
|---|---|---|
| GET | `/notifications` | Lista notificações (+ `unreadCount`) |
| PUT | `/notifications/:id/read` | Marca uma como lida |
| PUT | `/notifications/read-all` | Marca todas como lidas |

## Avaliações / progresso

| Método | Rota | Descrição | Papel |
|---|---|---|---|
| GET | `/evaluations/students` | Lista de alunos | tutor |
| POST | `/evaluations` | Registra avaliação (`student_id`, `note`, `progress`) | tutor |
| GET | `/evaluations/student/:studentId` | Histórico de avaliações do aluno | aluno (próprio) / tutor / responsável |

## Formato de erro padrão

```json
{ "error": "Mensagem legível em português explicando o que deu errado." }
```

Códigos HTTP usados: `400` (dados inválidos), `401` (não autenticado), `403` (sem
permissão), `404` (não encontrado), `409` (conflito, ex.: email duplicado), `500` (erro
interno).
