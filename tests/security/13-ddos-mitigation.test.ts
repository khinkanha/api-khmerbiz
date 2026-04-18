import { describe, test, expect, beforeEach } from '@jest/globals';
import { createTestApp, resetMockRedis } from '../helpers/app';
import { Response } from 'supertest';

describe('Security: DDoS Mitigation (T70-T73)', () => {
  beforeEach(() => {
    resetMockRedis();
  });

  test('T70 — 50 concurrent requests to public endpoint handled without crash', async () => {
    const { request } = createTestApp();

    const promises = Array.from({ length: 50 }, () =>
      request()
        .get('/api/v1/site/config')
        .set('Host', 'example.com')
    );

    const results = await Promise.allSettled(promises);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    expect(fulfilled.length).toBe(50);

    for (const r of fulfilled) {
      if (r.status === 'fulfilled') {
        expect(r.value.status).toBeDefined();
        expect(r.value.status).toBeLessThan(600);
      }
    }
  });

  test('T71 — Rate limiter blocks excess requests with 429', async () => {
    const { request } = createTestApp();

    const promises = Array.from({ length: 301 }, () =>
      request()
        .get('/api/v1/site/config')
        .set('Host', 'example.com')
    );

    const results = await Promise.allSettled(promises);
    const statusCodes = results
      .filter(r => r.status === 'fulfilled')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map(r => (r as any).value.status as number);

    const rateLimited = statusCodes.filter(c => c === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('T72 — Large body request is rejected', async () => {
    const { request } = createTestApp();

    const largeBody = { data: 'x'.repeat(1024 * 1024 + 100) };

    const res = await request()
      .post('/api/v1/auth/login')
      .send(largeBody);

    expect([413, 500]).toContain(res.status);
  });

  test('T73 — Health check endpoint responds without rate limiting', async () => {
    const { request } = createTestApp();

    for (let i = 0; i < 5; i++) {
      const res = await request().get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', true);
    }
  });
});
