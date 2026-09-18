// test/api.test.js — testes de integração da API do EducaMais+
// Roda com: DB_PATH=:memory: node --test test/
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

// Helpers -------------------------------------------------------------
async function registerUser(overrides = {}) {
  const payload = {
    name: 'Usuário Teste',
    email: `teste_${Date.now()}_${Math.random().toString(36).slice(2)}@educamais.com`,
    password: '123456',
    confirmPassword: '123456',
    role: 'aluno',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return res;
}

// ---------------------- AUTENTICAÇÃO ----------------------
test('registro cria usuário e retorna token', async () => {
  const res = await registerUser({ role: 'aluno' });
  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  assert.equal(res.body.user.role, 'aluno');
});

test('registro falha com senha curta', async () => {
  const res = await registerUser({ password: '123', confirmPassword: '123' });
  assert.equal(res.status, 400);
});

test('registro falha com email duplicado', async () => {
  const email = 'duplicado@educamais.com';
  await registerUser({ email });
  const res = await registerUser({ email });
  assert.equal(res.status, 409);
});

test('login com credenciais corretas retorna token', async () => {
  const email = 'login_ok@educamais.com';
  await registerUser({ email, password: 'senha123', confirmPassword: 'senha123' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'senha123' });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
});

test('login com senha errada retorna 401', async () => {
  const email = 'login_fail@educamais.com';
  await registerUser({ email, password: 'senha123', confirmPassword: 'senha123' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'errada' });
  assert.equal(res.status, 401);
});

test('rota protegida sem token retorna 401', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
});

// ---------------------- PERFIL / ACESSIBILIDADE ----------------------
test('atualizar preferências de acessibilidade do perfil', async () => {
  const reg = await registerUser();
  const token = reg.body.token;

  const res = await request(app)
    .put('/api/profile')
    .set('Authorization', `Bearer ${token}`)
    .send({ font_size: 'large', high_contrast: true, screen_reader: true, necessidades: 'Baixa visão' });

  assert.equal(res.status, 200);
  assert.equal(res.body.profile.font_size, 'large');
  assert.equal(res.body.profile.high_contrast, 1);
  assert.equal(res.body.profile.necessidades, 'Baixa visão');
});

// ---------------------- RBAC: BIBLIOTECA DE RECURSOS ----------------------
test('aluno NÃO pode publicar material (403)', async () => {
  const reg = await registerUser({ role: 'aluno' });
  const res = await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${reg.body.token}`)
    .send({ title: 'x', type: 'texto' });
  assert.equal(res.status, 403);
});

test('tutor PODE publicar material e ele aparece na listagem', async () => {
  const reg = await registerUser({ role: 'tutor', email: 'tutor_teste@educamais.com' });
  const create = await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${reg.body.token}`)
    .send({ title: 'Material de teste', type: 'texto', content: 'conteúdo', subject: 'Geral' });
  assert.equal(create.status, 201);

  const list = await request(app)
    .get('/api/resources')
    .set('Authorization', `Bearer ${reg.body.token}`);
  assert.equal(list.status, 200);
  assert.ok(list.body.resources.some((r) => r.title === 'Material de teste'));
});

test('publicar material notifica todos os alunos', async () => {
  const aluno = await registerUser({ role: 'aluno', email: 'aluno_notif@educamais.com' });
  const tutor = await registerUser({ role: 'tutor', email: 'tutor_notif@educamais.com' });

  await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${tutor.body.token}`)
    .send({ title: 'Novo material notificando', type: 'texto' });

  const notifs = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${aluno.body.token}`);

  assert.ok(notifs.body.notifications.some((n) => n.message.includes('Novo material notificando')));
});

test('pesquisa avançada filtra por texto', async () => {
  const tutor = await registerUser({ role: 'tutor', email: 'tutor_busca@educamais.com' });
  await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${tutor.body.token}`)
    .send({ title: 'Frações para iniciantes', type: 'texto', subject: 'Matemática' });

  const res = await request(app)
    .get('/api/resources?q=Frações')
    .set('Authorization', `Bearer ${tutor.body.token}`);

  assert.ok(res.body.resources.length >= 1);
  assert.ok(res.body.resources.every((r) => r.title.includes('Frações') || r.description?.includes('Frações')));
});

// ---------------------- FAVORITOS ----------------------
test('aluno favorita e desfavorita um recurso', async () => {
  const tutor = await registerUser({ role: 'tutor', email: 'tutor_fav@educamais.com' });
  const aluno = await registerUser({ role: 'aluno', email: 'aluno_fav@educamais.com' });

  const created = await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${tutor.body.token}`)
    .send({ title: 'Recurso favoritável', type: 'texto' });
  const resourceId = created.body.resource.id;

  const fav = await request(app)
    .post(`/api/favorites/${resourceId}`)
    .set('Authorization', `Bearer ${aluno.body.token}`);
  assert.equal(fav.status, 201);

  const list = await request(app)
    .get('/api/favorites')
    .set('Authorization', `Bearer ${aluno.body.token}`);
  assert.ok(list.body.favorites.some((f) => f.id === resourceId));

  const remove = await request(app)
    .delete(`/api/favorites/${resourceId}`)
    .set('Authorization', `Bearer ${aluno.body.token}`);
  assert.equal(remove.status, 200);
});

// ---------------------- FÓRUM ----------------------
test('fluxo completo do fórum: criar canal e trocar mensagens', async () => {
  const a = await registerUser({ role: 'aluno', email: 'forum_a@educamais.com' });
  const b = await registerUser({ role: 'aluno', email: 'forum_b@educamais.com' });

  const channel = await request(app)
    .post('/api/forum/channels')
    .set('Authorization', `Bearer ${a.body.token}`)
    .send({ name: 'Canal de Teste' });
  assert.equal(channel.status, 201);
  const channelId = channel.body.channel.id;

  await request(app)
    .post(`/api/forum/channels/${channelId}/messages`)
    .set('Authorization', `Bearer ${a.body.token}`)
    .send({ content: 'Oi, tudo bem?' });

  await request(app)
    .post(`/api/forum/channels/${channelId}/messages`)
    .set('Authorization', `Bearer ${b.body.token}`)
    .send({ content: 'Tudo ótimo!' });

  const messages = await request(app)
    .get(`/api/forum/channels/${channelId}/messages`)
    .set('Authorization', `Bearer ${a.body.token}`);

  assert.equal(messages.body.messages.length, 2);
});

test('mensagem vazia no fórum é rejeitada', async () => {
  const a = await registerUser({ role: 'aluno', email: 'forum_empty@educamais.com' });
  const channel = await request(app)
    .post('/api/forum/channels')
    .set('Authorization', `Bearer ${a.body.token}`)
    .send({ name: 'Canal Vazio' });

  const res = await request(app)
    .post(`/api/forum/channels/${channel.body.channel.id}/messages`)
    .set('Authorization', `Bearer ${a.body.token}`)
    .send({ content: '   ' });

  assert.equal(res.status, 400);
});

// ---------------------- AVALIAÇÕES / PROGRESSO ----------------------
test('tutor avalia aluno; aluno vê a própria avaliação; outro aluno é bloqueado', async () => {
  const tutor = await registerUser({ role: 'tutor', email: 'tutor_eval@educamais.com' });
  const aluno = await registerUser({ role: 'aluno', email: 'aluno_eval@educamais.com' });
  const outroAluno = await registerUser({ role: 'aluno', email: 'outro_aluno_eval@educamais.com' });

  const evalRes = await request(app)
    .post('/api/evaluations')
    .set('Authorization', `Bearer ${tutor.body.token}`)
    .send({ student_id: aluno.body.user.id, note: 'Bom progresso', progress: 80 });
  assert.equal(evalRes.status, 201);

  const own = await request(app)
    .get(`/api/evaluations/student/${aluno.body.user.id}`)
    .set('Authorization', `Bearer ${aluno.body.token}`);
  assert.equal(own.status, 200);
  assert.equal(own.body.evaluations.length, 1);

  const blocked = await request(app)
    .get(`/api/evaluations/student/${aluno.body.user.id}`)
    .set('Authorization', `Bearer ${outroAluno.body.token}`);
  assert.equal(blocked.status, 403);
});

// ---------------------- SAÚDE DA API ----------------------
test('healthcheck responde ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});
