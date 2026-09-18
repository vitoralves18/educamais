// seed.js — popula o banco com dados de exemplo para facilitar testes e demonstração
const bcrypt = require('bcryptjs');
const db = require('./db');

function upsertUser(name, email, password, role) {
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (user) return user;
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)')
    .run(name, email, hash, role);
  db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(info.lastInsertRowid);
  return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
}

console.log('Seeding banco de dados do EducaMais+...');

const aluno1 = upsertUser('Aluno X', 'alunox@educamais.com', '123456', 'aluno');
const aluno2 = upsertUser('Aluno Y', 'alunoy@educamais.com', '123456', 'aluno');
const aluno3 = upsertUser('Aluno Z', 'alunoz@educamais.com', '123456', 'aluno');
const tutor1 = upsertUser('Professora Ana', 'tutor@educamais.com', '123456', 'tutor');
const resp1 = upsertUser('Responsável Carla', 'responsavel@educamais.com', '123456', 'responsavel');

// Recursos de exemplo
const resourceCount = db.prepare('SELECT COUNT(*) AS c FROM resources').get().c;
if (resourceCount === 0) {
  const insertResource = db.prepare(
    `INSERT INTO resources (title, description, content, type, subject, tags, created_by)
     VALUES (?,?,?,?,?,?,?)`
  );

  insertResource.run(
    'Interpretação de texto — Modernidade',
    'Atividade de leitura e interpretação com questão de múltipla escolha, com opção de áudio.',
    JSON.stringify({
      questao: 'Ser moderno é encontrar-se em um ambiente que promete aventura, poder, alegria, crescimento, autotransformação e transformação das coisas em redor — mas ao mesmo tempo ameaça destruir tudo o que temos, tudo o que sabemos, tudo o que somos. O texto apresenta uma interpretação da modernidade que a caracteriza como uma(o):',
      alternativas: [
        'dinâmica social contraditória.',
        'interação coletiva harmônica.',
        'fenômeno econômico estável.',
        'sistema internacional decadente.',
        'processo histórico homogeneizador.'
      ],
      resposta: 0
    }),
    'atividade', 'Português', 'leitura,interpretação,modernidade', tutor1.id
  );

  insertResource.run(
    'Introdução às frações',
    'Vídeo curto explicando o conceito de frações com legendas.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'video', 'Matemática', 'frações,matemática básica', tutor1.id
  );

  insertResource.run(
    'Texto adaptado: O ciclo da água',
    'Texto em linguagem simples e objetiva sobre o ciclo da água, com apoio visual.',
    'A água evapora dos rios, lagos e mares. Ela sobe e forma nuvens. Quando as nuvens ficam pesadas, a água cai como chuva. Esse processo se repete sempre. Chamamos isso de ciclo da água.',
    'texto', 'Ciências', 'ciclo da água,ciências,natureza', tutor1.id
  );

  console.log('Recursos de exemplo criados.');
}

// Canal do fórum
let channel = db.prepare('SELECT * FROM forum_channels WHERE name = ?').get('Turma Geral');
if (!channel) {
  const info = db.prepare('INSERT INTO forum_channels (name) VALUES (?)').run('Turma Geral');
  channel = db.prepare('SELECT * FROM forum_channels WHERE id = ?').get(info.lastInsertRowid);

  const insertMsg = db.prepare('INSERT INTO forum_messages (channel_id, user_id, content) VALUES (?,?,?)');
  insertMsg.run(channel.id, aluno1.id, 'Oi pessoal, alguém entendeu a atividade de português?');
  insertMsg.run(channel.id, aluno2.id, 'Eu também tive dúvida na questão 1!');
  insertMsg.run(channel.id, tutor1.id, 'Pessoal, posso ativar o leitor de tela na atividade se ajudar. Qualquer dúvida me chamem por aqui.');
  console.log('Canal "Turma Geral" criado com mensagens de exemplo.');
}

console.log('\nSeed concluído! Contas de teste (senha: 123456):');
console.log('  Aluno:       alunox@educamais.com');
console.log('  Tutor:       tutor@educamais.com');
console.log('  Responsável: responsavel@educamais.com');
