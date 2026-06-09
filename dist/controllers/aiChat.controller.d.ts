import { Request, Response, NextFunction } from 'express';
export declare function sendMessage(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getJobStatus(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getUsage(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getOperationHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getContentVersions(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function checkHealth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function confirmAction(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function rejectAction(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function rollbackOperation(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=aiChat.controller.d.ts.map