import { PaginationMeta } from '../types/api';
export declare function getPagination(page?: number, limit?: number): {
    offset: number;
    limit: number;
};
export declare function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta;
//# sourceMappingURL=pagination.d.ts.map