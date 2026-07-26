"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDesign = getDesign;
exports.saveDesign = saveDesign;
const SiteDesign_1 = require("../models/SiteDesign");
const cache_1 = require("../middleware/cache");
/**
 * GET /admin/design — return the authenticated user's published SiteDesign
 * as a parsed object. Responds with `data: null` when no design exists yet
 * (the frontend then seeds from the current theme client-side).
 */
async function getDesign(req, res, next) {
    try {
        const design = await SiteDesign_1.SiteDesign.getPublishedConfig(req.user.domainId);
        res.json({ status: true, data: design });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PUT /admin/design — upsert the authenticated user's published SiteDesign.
 * Body is the full design object; it is stored as a JSON string. The domain_id
 * is taken from the authenticated user (authoritative), not the request body.
 */
async function saveDesign(req, res, next) {
    try {
        const domainId = req.user.domainId;
        const json = JSON.stringify(req.body);
        const existing = await SiteDesign_1.SiteDesign.getPublishedByDomain(domainId);
        if (existing) {
            await SiteDesign_1.SiteDesign.query()
                .patch({ design: json })
                .where('site_design_id', existing.site_design_id);
        }
        else {
            await SiteDesign_1.SiteDesign.query().insert({
                domain_id: domainId,
                design: json,
                status: 1,
            });
        }
        // Public /site/config is cached; clear it so the new design is visible.
        await (0, cache_1.invalidateDomainCache)(domainId);
        res.json({ status: true, data: req.body });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=design.controller.js.map