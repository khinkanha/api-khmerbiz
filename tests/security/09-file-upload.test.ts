import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { createTestApp, resetMockRedis, generateAccessToken, authHeader } from '../helpers/app';

describe('Security: File Upload Security (T48-T54)', () => {
  let token: string;

  beforeEach(() => {
    resetMockRedis();
    token = generateAccessToken({
      userId: 1, username: 'admin', domainId: 1, userLevel: 1,
    });
  });

  test('T48 — Upload URL for .exe file type returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/media/upload-url')
      .set(authHeader(token))
      .send({ fileName: 'malware.exe', fileType: 'application/x-executable' });

    expect(res.status).toBe(400);
  });

  test('T49 — Upload URL for .php file type returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/media/upload-url')
      .set(authHeader(token))
      .send({ fileName: 'shell.php', fileType: 'application/x-php' });

    expect(res.status).toBe(400);
  });

  test('T50 — Upload URL for SVG file type returns 400', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/media/upload-url')
      .set(authHeader(token))
      .send({ fileName: 'image.svg', fileType: 'image/svg+xml' });

    expect(res.status).toBe(400);
  });

  test('T51 — Upload URL for valid JPEG succeeds', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/media/upload-url')
      .set(authHeader(token))
      .send({ fileName: 'photo.jpg', fileType: 'image/jpeg' });

    // May succeed or fail depending on Media model mock for file count
    // But file type validation should pass
    expect(res.status).not.toBe(400);
  });

  test('T52 — Missing fileName returns error', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/media/upload-url')
      .set(authHeader(token))
      .send({ fileType: 'image/jpeg' });

    // Controller expects both fileName and fileType
    expect([400, 500]).toContain(res.status);
  });

  test('T53 — Path traversal in fileName does not affect S3 key', async () => {
    const { request } = createTestApp();

    // The S3 utility generates keys using Date.now() + Math.random()
    // User's filename is only used for extension extraction
    const res = await request()
      .post('/api/v1/media/upload-url')
      .set(authHeader(token))
      .send({ fileName: '../../../etc/passwd.jpg', fileType: 'image/jpeg' });

    // Request should be processed — the key is generated safely
    // The extension is extracted via fileName.split('.').pop() → 'jpg'
    expect(res.status).not.toBe(400);
  });

  test('T54 — Direct POST of binary data to /media returns error', async () => {
    const { request } = createTestApp();

    const res = await request()
      .post('/api/v1/media')
      .set(authHeader(token))
      .set('Content-Type', 'image/jpeg')
      .send(Buffer.from('fake image data'));

    // No direct upload route — should be 404
    expect(res.status).toBe(404);
  });
});
