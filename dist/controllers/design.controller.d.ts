import { Request, Response, NextFunction } from 'express';
/**
 * GET /admin/design — return the authenticated user's published SiteDesign
 * as a parsed object. Responds with `data: null` when no design exists yet
 * (the frontend then seeds from the current theme client-side).
 */
export declare function getDesign(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /admin/design — upsert the authenticated user's published SiteDesign.
 * Body is the full design object; it is stored as a JSON string. The domain_id
 * is taken from the authenticated user (authoritative), not the request body.
 */
export declare function saveDesign(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=design.controller.d.ts.map