import { Request, Response, NextFunction } from 'express';
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): void;
export declare function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): void;
export declare function requireWebAdmin(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map