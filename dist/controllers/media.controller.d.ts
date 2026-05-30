import { Request, Response, NextFunction } from 'express';
export declare function listMedia(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requestUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function confirmUpload(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getMediaUrl(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteMedia(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=media.controller.d.ts.map