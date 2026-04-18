import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { BadRequestError } from '../utils/errors';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json({ status: true, data: result });
  } catch (err) { next(err); }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await authService.signup(req.body);
    res.status(201).json({ status: true, data: { userid: userId }, message: 'Account created. Please verify your email.' });
  } catch (err) { next(err); }
}

export async function verifyAccount(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.verifyAccount(req.body.username, req.body.code);
    res.json({ status: true, message: 'Account verified' });
  } catch (err) { next(err); }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    res.json({ status: true, data: result });
  } catch (err) { next(err); }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new BadRequestError('Not authenticated');
    await authService.logout(req.user.userId, req.body.refreshToken || '');
    res.json({ status: true, message: 'Logged out' });
  } catch (err) { next(err); }
}
