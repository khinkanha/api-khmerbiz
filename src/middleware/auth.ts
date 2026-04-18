import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { JwtPayload } from '../types/api';
import { UnauthorizedError } from '../utils/errors';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    if (decoded.type !== 'access') {
      return next(new UnauthorizedError('Invalid token type'));
    }
    req.user = {
      userId: decoded.sub,
      username: decoded.username,
      domainId: decoded.domainId,
      userLevel: decoded.userLevel,
      sitebuilder: decoded.sitebuilder,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token expired'));
    }
    return next(new UnauthorizedError('Invalid token'));
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  next();
}

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  if (req.user.userLevel !== -1) {
    return next(new UnauthorizedError('Super Admin access required'));
  }
  next();
}

export function requireWebAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  if (req.user.userLevel > 1) {
    return next(new UnauthorizedError('Admin access required'));
  }
  next();
}
