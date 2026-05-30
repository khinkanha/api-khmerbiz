import { Request, Response, NextFunction } from 'express';
export declare function cacheMiddleware(ttl?: number): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare function invalidateDomainCache(domainId: number): Promise<void>;
//# sourceMappingURL=cache.d.ts.map