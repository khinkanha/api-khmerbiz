import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/index';
import { JwtPayload, LoginResponse } from '../types/api';
import { comparePassword, hashPassword } from '../utils/password';
import { UnauthorizedError, BadRequestError, ForbiddenError } from '../utils/errors';
import { redis } from '../config/redis';

function generateAccessToken(user: User): string {
  const payload: JwtPayload = {
    sub: user.userid,
    username: user.username,
    domainId: user.domain_id,
    userLevel: user.user_level,
    sitebuilder: user.sitebuilder === 1,
    type: 'access',
  };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessExpiry } as SignOptions);
}

function generateRefreshToken(userId: number): string {
  const payload = { sub: userId, type: 'refresh' as const };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.refreshExpiry } as SignOptions);
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  // Check failed attempts
  const failKey = `auth:failed:${username}`;
  const failCount = parseInt(await redis.get(failKey) || '0', 10);
  if (failCount >= 5) {
    throw new ForbiddenError('Account locked. Try again in 30 minutes.');
  }

  const user = await User.query()
    .where('username', username)
    .withGraphFetched('domain')
    .first();

  if (!user) {
    await redis.incr(failKey);
    await redis.expire(failKey, 1800);
    throw new UnauthorizedError('Invalid username or password');
  }

  // Check verification
  if (user.verify_code) {
    throw new ForbiddenError('Please verify your account first');
  }

  // Compare password (handles MD5 migration)
  const { match, needsRehash } = await comparePassword(password, user.password);

  if (!match) {
    await redis.incr(failKey);
    await redis.expire(failKey, 1800);
    throw new UnauthorizedError('Invalid username or password');
  }

  // Rehash if MD5 → bcrypt migration needed
  if (needsRehash) {
    const newHash = await hashPassword(password);
    await User.query().patch({ password: newHash }).where('userid', user.userid);
  }

  // Clear failed attempts
  await redis.del(failKey);

  // Check domain status
  if (user.domain?.status !== Domain.ACTIVE && user.user_level !== -1) {
    throw new ForbiddenError('Domain is suspended or expired');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.userid);

  // Store refresh token in Redis
  await redis.setex(`refresh:${user.userid}:${refreshToken.slice(-20)}`, 7 * 24 * 3600, 'valid');

  return {
    accessToken,
    refreshToken,
    user: {
      userid: user.userid,
      username: user.username,
      full_name: user.full_name,
      domain_id: user.domain_id,
      user_level: user.user_level,
      sitebuilder: user.sitebuilder === 1,
    },
  };
}

export async function signup(data: { username: string; password: string; full_name: string; phone: string; email: string }): Promise<number> {
  const existing = await User.getByUsername(data.username);
  if (existing) {
    throw new BadRequestError('Username already exists');
  }

  const emailExists = await User.isEmailExist(data.email);
  if (emailExists) {
    throw new BadRequestError('Email already exists');
  }

  const hashedPassword = await hashPassword(data.password);
  const verifyCode = Math.random().toString(36).substring(2, 8);

  const user = await User.query().insert({
    username: data.username,
    password: hashedPassword,
    full_name: data.full_name,
    phone: data.phone,
    email: data.email,
    verify_code: verifyCode,
    sitebuilder: 0,
    user_level: 2,
    domain_id: 0,
  });

  return user.userid;
}

export async function verifyAccount(username: string, code: string): Promise<void> {
  const user = await User.getByUsername(username);
  if (!user) {
    throw new BadRequestError('User not found');
  }
  if (user.verify_code !== code) {
    throw new BadRequestError('Invalid verification code');
  }
  await User.query().patch({ verify_code: null }).where('userid', user.userid);
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as unknown as { sub: number; type: string };
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Check if refresh token is still valid in Redis
    const redisKey = `refresh:${decoded.sub}:${refreshToken.slice(-20)}`;
    const exists = await redis.get(redisKey);
    if (!exists) {
      // Token reuse detected — revoke all tokens for this user
      const keys = await redis.keys(`refresh:${decoded.sub}:*`);
      if (keys.length) await redis.del(...keys);
      throw new UnauthorizedError('Token revoked');
    }

    // Delete old refresh token
    await redis.del(redisKey);

    const user = await User.query().findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user.userid);

    // Store new refresh token
    await redis.setex(`refresh:${user.userid}:${newRefreshToken.slice(-20)}`, 7 * 24 * 3600, 'valid');

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) throw err;
    throw new UnauthorizedError('Invalid refresh token');
  }
}

export async function logout(userId: number, refreshToken: string): Promise<void> {
  const redisKey = `refresh:${userId}:${refreshToken.slice(-20)}`;
  await redis.del(redisKey);
}

// Need to import Domain for status check
import { Domain } from '../models/Domain';
