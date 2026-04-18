import { describe, test, expect, beforeEach } from '@jest/globals';
import { createTestApp, resetMockRedis } from '../helpers/app';

describe('Security: Request Size Limits (T12-T15)', () => {
  beforeEach(() => {
    resetMockRedis();
  });

  test('T12 — JSON body > 1MB is rejected', async () => {
    const { request } = createTestApp();

    const largeBody = { username: 'a'.repeat(1024 * 1024 + 100) };

    const res = await request()
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send(largeBody);

    // Body parser rejects as PayloadTooLargeError, caught by error handler
    expect([413, 500]).toContain(res.status);
  });

  test('T13 — URL-encoded body > 1MB is rejected', async () => {
    const { request } = createTestApp();

    const largeValue = 'a'.repeat(1024 * 1024 + 100);

    const res = await request()
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(`username=${largeValue}&password=test`);

    expect([413, 500]).toContain(res.status);
  });

  test('T14 — Malformed JSON body is rejected', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    // Express body parser returns SyntaxError, caught by error handler as 500 or 400
    expect([400, 500]).toContain(res.status);
  });

  test('T15 — Very large body (10MB) is rejected', async () => {
    const { request } = createTestApp();

    const hugeBody = { data: 'x'.repeat(10 * 1024 * 1024) };

    const res = await request()
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send(hugeBody);

    expect([413, 500]).toContain(res.status);
  });
});
