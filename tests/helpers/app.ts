import request from 'supertest';
import Redis from 'ioredis-mock';
import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockRedis: any;

export function getMockRedis() {
  if (!mockRedis) {
    mockRedis = new Redis();
  }
  return mockRedis;
}

export function resetMockRedis(): void {
  mockRedis = new Redis();
}

/**
 * Create a test Express app with all external dependencies mocked.
 * Mocks Redis, Knex, S3, and Objection.js models.
 */
export function createTestApp() {
  const redis = getMockRedis();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any;

  jest.isolateModules(() => {
    // Mock ioredis
    jest.doMock('ioredis', () => {
      return function() { return redis; };
    });

    // Mock knex — return a minimal stub that doesn't connect
    jest.doMock('knex', () => {
      return function() {
        const qb: any = () => qb;
        qb.where = () => qb;
        qb.first = () => Promise.resolve(null);
        qb.then = (resolve: any) => Promise.resolve([]).then(resolve);
        qb.destroy = () => {};
        qb.raw = () => Promise.resolve([]);
        return qb;
      };
    });

    // Mock S3 client
    jest.doMock('../../src/config/s3', () => ({
      s3Client: { send: jest.fn().mockResolvedValue({}) },
    }));

    // Mock AWS SDK presigner
    jest.doMock('@aws-sdk/s3-request-presigner', () => ({
      getSignedUrl: jest.fn().mockResolvedValue('https://test-spaces.com/presigned-url'),
    }));

    // Mock Domain model — return null for getByName so domainScope passes through
    jest.doMock('../../src/models/Domain', () => ({
      Domain: {
        tableName: 'tbldomain',
        idColumn: 'domain_id',
        ACTIVE: 1,
        SUSPEND: 2,
        EXPIRED: 3,
        query: () => ({
          where: () => ({ first: () => Promise.resolve(null) }),
          patch: () => ({ where: () => Promise.resolve(1) }),
        }),
        getByName: jest.fn().mockResolvedValue(null),
        getStatusLabel: jest.fn(),
      },
    }));

    const { createApp } = require('../../src/app');
    app = createApp();
  });

  return {
    app: app!,
    redis,
    request: () => request(app),
  };
}

// JWT helpers
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-security-tests-only';

export function generateAccessToken(user: {
  userId: number;
  username: string;
  domainId: number;
  userLevel: number;
  sitebuilder?: boolean;
}): string {
  return jwt.sign(
    {
      sub: user.userId,
      username: user.username,
      domainId: user.domainId,
      userLevel: user.userLevel,
      sitebuilder: user.sitebuilder ?? false,
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function generateExpiredAccessToken(user: {
  userId: number;
  username: string;
  domainId: number;
  userLevel: number;
}): string {
  return jwt.sign(
    {
      sub: user.userId,
      username: user.username,
      domainId: user.domainId,
      userLevel: user.userLevel,
      sitebuilder: false,
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: '-1s' }
  );
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
