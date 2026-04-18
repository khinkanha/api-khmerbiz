import { describe, test, expect, beforeEach } from '@jest/globals';
import { createTestApp, resetMockRedis } from '../helpers/app';

describe('Security: Helmet Security Headers (T55-T59)', () => {
  beforeEach(() => {
    resetMockRedis();
  });

  test('T55 — Strict-Transport-Security header is present', async () => {
    const { request } = createTestApp();

    const res = await request().get('/api/v1/health');

    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['strict-transport-security']).toMatch(/max-age=/);
  });

  test('T56 — X-Content-Type-Options header is nosniff', async () => {
    const { request } = createTestApp();

    const res = await request().get('/api/v1/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('T57 — X-Frame-Options header is present', async () => {
    const { request } = createTestApp();

    const res = await request().get('/api/v1/health');

    expect(res.headers['x-frame-options']).toBeDefined();
  });

  test('T58 — Content-Security-Policy header is present when not in dev mode', async () => {
    const { request } = createTestApp();

    // NODE_ENV=test → config.isDev = false → CSP is enabled
    const res = await request().get('/api/v1/health');

    expect(res.headers['content-security-policy']).toBeDefined();
  });

  test('T59 — X-Powered-By header is removed by Helmet', async () => {
    const { request } = createTestApp();

    const res = await request().get('/api/v1/health');

    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
