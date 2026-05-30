"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = getPagination;
exports.buildPaginationMeta = buildPaginationMeta;
function getPagination(page = 1, limit = 10) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    return {
        offset: (safePage - 1) * safeLimit,
        limit: safeLimit,
    };
}
function buildPaginationMeta(page, limit, total) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    return {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
    };
}
//# sourceMappingURL=pagination.js.map