import { Request, Response, NextFunction } from 'express';
export declare function getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function resetUserPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function assignDomain(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map