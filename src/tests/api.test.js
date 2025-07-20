const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const path = require('path');

describe('API Central Docs', () => {
  let server, token, datasetId;

  beforeAll(async () => {
    server = app.listen(4002);

    // Limpa o banco de dados de teste
    await prisma.query.deleteMany();
    await prisma.record.deleteMany();
    await prisma.dataset.deleteMany();
    await prisma.user.deleteMany();

    // Cria usuário e faz login
    await request(server).post('/auth/register').send({
      nome: 'TestUser',
      email: 'testuser@exemplo.com',
      senha: '123456'
    });
    const login = await request(server).post('/auth/login').send({
      email: 'testuser@exemplo.com',
      senha: '123456'
    });
    token = login.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  it('deve retornar dados do usuário autenticado', async () => {
    const res = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'testuser@exemplo.com');
  });

  it('deve fazer upload de um CSV e ingerir registros', async () => {
    const res = await request(server)
      .post('/datasets/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', path.join(__dirname, '../../exemplo.csv'));
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('registros_importados');
    datasetId = res.body.id;
  });

  it('deve listar os datasets do usuário', async () => {
    const res = await request(server)
      .get('/datasets')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deve listar os registros do dataset', async () => {
    const res = await request(server)
      .get(`/datasets/${datasetId}/records`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deve buscar registros por campo/valor', async () => {
    const res = await request(server)
      .get(`/datasets/${datasetId}/records/search?campo=nome&valor=João`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Pode ser vazio se não houver "João" no CSV, mas não deve dar erro
  });

  it('deve registrar uma query simulada', async () => {
    const res = await request(server)
      .post('/queries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pergunta: 'Qual a idade de João?',
        resposta: '30'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('pergunta', 'Qual a idade de João?');
    expect(res.body).toHaveProperty('resposta', '30');
  });

  it('deve listar queries feitas pelo usuário', async () => {
    const res = await request(server)
      .get('/queries')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});