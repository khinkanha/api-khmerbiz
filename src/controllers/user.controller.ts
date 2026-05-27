import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { hashPassword } from '../utils/password';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { getPagination, buildPaginationMeta } from '../utils/pagination';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.query().findById(req.user!.userId);
    if (!user) throw new NotFoundError('User not found');
    res.json({ status: true, data: user });
  } catch (err) { next(err); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    await User.query().patch(req.body).where('userid', req.user!.userId);
    const user = await User.query().findById(req.user!.userId);
    res.json({ status: true, data: user });
  } catch (err) { next(err); }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.query().findById(req.user!.userId);
    if (!user) throw new NotFoundError('User not found');

    const { comparePassword } = await import('../utils/password');
    const { match } = await comparePassword(currentPassword, user.password);
    if (!match) throw new ForbiddenError('Current password is incorrect');

    const hashed = await hashPassword(newPassword);
    await User.query().patch({ password: hashed }).where('userid', req.user!.userId);
    res.json({ status: true, message: 'Password changed' });
  } catch (err) { next(err); }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { offset, limit: safeLimit } = getPagination(page, limit);

    // WebAdmin can only see users in their domain
    const domainFilter = req.user!.userLevel !== -1 ? req.user!.domainId : undefined;

    const [items, countResult] = await Promise.all([
      User.query()
        .modify(q => { if (domainFilter !== undefined) q.where('domain_id', domainFilter) })
        .orderBy('userid').limit(safeLimit).offset(offset),
      User.query()
        .modify(q => { if (domainFilter !== undefined) q.where('domain_id', domainFilter) })
        .count('userid as count').first(),
    ]);

    const total = Number((countResult as any)?.count) || 0;
    res.json({ status: true, data: { items, pagination: buildPaginationMeta(page, safeLimit, total) } });
  } catch (err) { next(err); }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseInt(req.params.userId);
    const user = await User.query().findById(userId);
    if (!user) throw new NotFoundError('User not found');

    // WebAdmin can only see their domain's users
    if (req.user!.userLevel !== -1 && user.domain_id !== req.user!.domainId) {
      throw new ForbiddenError('Access denied');
    }

    res.json({ status: true, data: user });
  } catch (err) { next(err); }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const hashedPassword = await hashPassword(req.body.password);
    const user = await User.query().insert({
      username: req.body.username,
      password: hashedPassword,
      full_name: req.body.full_name,
      phone: req.body.phone || '',
      email: req.body.email || '',
      domain_id: req.body.domain_id ?? req.user!.domainId,
      user_level: req.body.user_level || 2,
      sitebuilder: 0,
    });
    res.status(201).json({ status: true, data: user });
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseInt(req.params.userId);
    const updates: Record<string, any> = {};
    if (req.body.full_name !== undefined) updates.full_name = req.body.full_name;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.domain_id !== undefined) updates.domain_id = req.body.domain_id;
    if (req.body.user_level !== undefined) updates.user_level = req.body.user_level;

    await User.query().patch(updates).where('userid', userId);
    const user = await User.query().findById(userId);
    res.json({ status: true, data: user });
  } catch (err) { next(err); }
}

export async function resetUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseInt(req.params.userId);
    const hashedPassword = await hashPassword(req.body.password);
    await User.query().patch({ password: hashedPassword }).where('userid', userId);
    res.json({ status: true, message: 'Password reset' });
  } catch (err) { next(err); }
}

export async function assignDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseInt(req.params.userId);
    await User.query().patch({
      domain_id: req.body.domain_id,
      user_level: req.body.user_level,
    }).where('userid', userId);
    res.json({ status: true, message: 'Domain assigned' });
  } catch (err) { next(err); }
}
