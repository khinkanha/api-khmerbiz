import { Request, Response, NextFunction } from 'express';
export declare function getSiteConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSiteMenu(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSiteHome(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getSitePage(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSiteNews(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSiteArticle(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSiteBanners(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSiteDefault(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getFeatureNews(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getListNews(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=website.controller.d.ts.map