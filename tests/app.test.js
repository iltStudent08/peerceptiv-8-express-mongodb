const request = require('supertest');
const app = require('../src/app');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

describe('Base API scaffolding', () => {
  it('supports health checks', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('validates auth input before controller logic', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'A',
      email: 'invalid-email',
      password: '123'
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
  });

  it('protects auth me route without bearer token', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token missing/i);
  });
});

describe('Book catalog', () => {
  it('requires a token to create a book', async () => {
    const response = await request(app).post('/api/v1/books').send({});

    expect(response.status).toBe(401);
  });

  it('rejects an invalid token before running controller logic', async () => {
    const response = await request(app)
      .post('/api/v1/books')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ title: 'A', isbn: '123', genre: 'cooking', publishedYear: 1200, price: -5 });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid token/i);
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/books-unknown');

    expect(response.status).toBe(404);
  });
});
