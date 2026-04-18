import { describe, test, expect, beforeEach } from '@jest/globals';
import { createTestApp, getMockRedis, resetMockRedis } from '../helpers/app';
import { generateAccessToken, authHeader } from '../helpers/app';
import { createTestUser } from '../helpers/fixtures';

describe('Security: Rate Limiting (T1-T6)', () => {
  beforeEach(() => {
    resetMockRedis();
  });

  test('T1 — 11th login request within 15 min returns 429', async () => {
    const { request } = createTestApp();
    const credentials = { username: 'testuser', password: 'wrongpassword' };

    // Send 10 requests — should all be processed (even if returning 401)
    for (let i = 0; i < 10; i++) {
      await request().post('/api/v1/auth/login').send(credentials);
    }

    // 11th request should be rate limited
    const res = await request().post('/api/v1/auth/login').send(credentials);
    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/too many/i);
  });

  test('T2 — 101st API request within 15 min returns 429', async () => {
    const { request } = createTestApp();
    const token = generateAccessToken({
      userId: 1,
      username: 'testuser',
      domainId: 1,
      userLevel: 1,
    });

    // Send 100 requests
    for (let i = 0; i < 100; i++) {
      await request()
        .get('/api/v1/content')
        .set(authHeader(token));
    }

    // 101st should be rate limited
    const res = await request()
      .get('/api/v1/content')
      .set(authHeader(token));
    expect(res.status).toBe(429);
  });

  test('T3 — 301st public request within 15 min returns 429', async () => {
    const { request } = createTestApp();

    // Send 300 requests
    for (let i = 0; i < 300; i++) {
      await request()
        .get('/api/v1/site/config')
        .set('Host', 'example.com');
    }

    // 301st should be rate limited
    const res = await request()
      .get('/api/v1/site/config')
      .set('Host', 'example.com');
    expect(res.status).toBe(429);
  });

  test('T4 — 21st upload request within 15 min returns 429', async () => {
    const { request } = createTestApp();
    const token = generateAccessToken({
      userId: 1,
      username: 'testuser',
      domainId: 1,
      userLevel: 1,
    });

    // Send 20 upload requests
    for (let i = 0; i < 20; i++) {
      await request()
        .post('/api/v1/media/upload-url')
        .set(authHeader(token))
        .send({ fileName: 'test.jpg', fileType: 'image/jpeg' });
    }

    // 21st should be rate limited
    const res = await request()
      .post('/api/v1/media/upload-url')
      .set(authHeader(token))
      .send({ fileName: 'test.jpg', fileType: 'image/jpeg' });
    expect(res.status).toBe(429);
  });

  test('T5 — Response contains RateLimit standard headers', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/login')
      .send({ username: 'test', password: 'test' });

    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
    expect(res.headers['ratelimit-reset']).toBeDefined();
  });

  test('T6 — Legacy X-RateLimit headers are NOT present', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/login')
      .send({ username: 'test', password: 'test' });

    expect(res.headers['x-ratelimit-limit']).toBeUndefined();
    expect(res.headers['x-ratelimit-remaining']).toBeUndefined();
  });
});
