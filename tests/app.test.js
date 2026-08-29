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
