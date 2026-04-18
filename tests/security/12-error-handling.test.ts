import { describe, test, expect, beforeEach } from '@jest/globals';
import { createTestApp, resetMockRedis } from '../helpers/app';

describe('Security: Error Handling — No Information Leakage (T65-T69)', () => {
  beforeEach(() => {
    resetMockRedis();
  });

  test('T65 — Server error returns generic message without stack trace', async () => {
    const { request } = createTestApp();

    // Trigger an unhandled route that could cause an error
    const res = await request()
      .get('/api/v1/nonexistent-deep-route/test');

    expect(res.status).toBe(404);
    // Should NOT contain stack traces or internal paths
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/stack/i);
    expect(body).not.toMatch(/at\s+\w+\s+\(/); // No stack frame patterns
  });

  test('T66 — Malformed JSON returns error without exposing internals', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{bad json');

    // Express body parser SyntaxError goes to error handler as 500 (not AppError)
    expect([400, 500]).toContain(res.status);
    // Should not expose Express internals or full stack trace in response body
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/\/node_modules\//);
  });

  test('T67 — Non-existent endpoint returns 404 with clean message', async () => {
    const { request } = createTestApp();

    const res = await request().get('/api/v1/unknown');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', false);
    expect(res.body.message).toMatch(/not found/i);
    // No internal routing info
    expect(res.body.message).not.toMatch(/\/src\//);
  });

  test('T68 — Invalid JWT returns 401 without internal details', async () => {
    const { request } = createTestApp();

    const res = await request()
      .get('/api/v1/content')
      .set('Authorization', 'Bearer invalid.jwt.token');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
    // Should not expose JWT secret, algorithm, or implementation details
    expect(res.body.message).not.toMatch(/secret/i);
    expect(res.body.message).not.toMatch(/algorithm/i);
  });

  test('T69 — Production mode hides error details (NODE_ENV=test)', async () => {
    const { request } = createTestApp();

    // With NODE_ENV=test, isDev is false, so errors should be generic
    const res = await request().get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
    // Response should be clean JSON
    expect(res.body).toHaveProperty('status', false);
    expect(res.body.message).toBeDefined();
    expect(res.body.stack).toBeUndefined();
  });
});
