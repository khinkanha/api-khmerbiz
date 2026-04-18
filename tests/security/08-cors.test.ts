import { describe, test, expect, beforeEach } from '@jest/globals';
import { createTestApp, resetMockRedis } from '../helpers/app';

describe('Security: CORS Configuration (T43-T47)', () => {
  beforeEach(() => {
    resetMockRedis();
  });

  test('T43 — Request from allowed origin includes CORS headers', async () => {
    const { request } = createTestApp();

    const res = await request()
      .options('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000');

    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  test('T44 — Request from any origin is allowed (current dev config)', async () => {
    const { request } = createTestApp();

    const res = await request()
      .options('/api/v1/auth/login')
      .set('Origin', 'https://evil.com');

    // Current config has origin: true (allows all origins)
    expect(res.headers['access-control-allow-origin']).toBe('https://evil.com');
    // NOTE: This documents a security finding — production should restrict origins
  });

  test('T45 — Custom header not in allowedHeaders is rejected in preflight', async () => {
    const { request } = createTestApp();

    const res = await request()
      .options('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Headers', 'X-Custom-Forbidden-Header');

    const allowedHeaders = res.headers['access-control-allow-headers'];
    // Only Content-Type, Authorization, X-Forwarded-Host are allowed
    if (allowedHeaders) {
      expect(allowedHeaders).not.toContain('X-Custom-Forbidden-Header');
    }
  });

  test('T46 — OPTIONS preflight returns correct methods', async () => {
    const { request } = createTestApp();

    const res = await request()
      .options('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.status).toBe(204);
    const allowMethods = res.headers['access-control-allow-methods'];
    if (allowMethods) {
      expect(allowMethods).toContain('GET');
      expect(allowMethods).toContain('POST');
      expect(allowMethods).toContain('PUT');
      expect(allowMethods).toContain('DELETE');
    }
  });

  test('T47 — Preflight cache max-age is set to 86400 (24h)', async () => {
    const { request } = createTestApp();

    const res = await request()
      .options('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000');

    expect(res.headers['access-control-max-age']).toBe('86400');
  });
});
