import { PaginationMeta } from '../types/api';

export function getPagination(page: number = 1, limit: number = 10): { offset: number; limit: number } {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);
  return {
    offset: (safePage - 1) * safeLimit,
    limit: safeLimit,
  };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);
  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
}
