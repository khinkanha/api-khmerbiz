import { describe, test, expect, beforeEach } from '@jest/globals';
import { createTestApp, resetMockRedis } from '../helpers/app';

describe('Security: Input Validation / Zod (T16-T23)', () => {
  beforeEach(() => {
    resetMockRedis();
  });

  test('T16 — Empty body on POST /auth/login returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/validation/i);
  });

  test('T17 — Username with SQL injection chars returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/signup')
      .send({
        username: "admin' OR 1=1 --",
        password: 'password123',
        full_name: 'Hacker',
        phone: '+85512345678',
        email: 'hacker@test.com',
      });

    expect(res.status).toBe(400);
    // The login schema uses z.string().min(3).max(50) — no regex restriction
    // but signup uses regex /^[a-zA-Z0-9_]+$/
    expect(res.body.message).toMatch(/validation/i);
  });

  test('T18 — Invalid email format returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/signup')
      .send({
        username: 'validuser',
        password: 'password123',
        full_name: 'Test User',
        phone: '+85512345678',
        email: 'invalid',
      });

    expect(res.status).toBe(400);
  });

  test('T19 — Password shorter than 6 chars returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/signup')
      .send({
        username: 'validuser',
        password: 'a',
        full_name: 'Test User',
        phone: '+85512345678',
        email: 'test@example.com',
      });

    expect(res.status).toBe(400);
  });

  test('T20 — Phone with letters returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/signup')
      .send({
        username: 'validuser',
        password: 'password123',
        full_name: 'Test User',
        phone: 'abc123',
        email: 'test@example.com',
      });

    expect(res.status).toBe(400);
  });

  test('T21 — Missing refreshToken in refresh request returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/refresh')
      .send({});

    expect(res.status).toBe(400);
  });

  test('T22 — Short username (< 3 chars) returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/signup')
      .send({
        username: 'ab',
        password: 'password123',
        full_name: 'Test',
        phone: '+85512345678',
        email: 'test@example.com',
      });

    expect(res.status).toBe(400);
  });

  test('T23 — Extra unexpected fields are stripped by Zod', async () => {
    const { request } = createTestApp();

    // Zod .object() strips unknown keys by default
    const res = await request()
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: 'some-token-value-here',
        maliciousField: 'should-be-stripped',
      });

    // The request should pass validation (refreshToken is valid)
    // The extra field is stripped by Zod
    // Will get 401 because token is invalid, but NOT 400
    expect(res.status).not.toBe(400);
  });
});
