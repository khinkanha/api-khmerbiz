"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteDesign = void 0;
const BaseModel_1 = require("./BaseModel");
/**
 * A tenant's full Site Designer document (colors/fonts + header/footer/page
 * composition). The `design` column stores the SiteDesign JSON as a string
 * (utf8mb4 so Khmer/Chinese survive). One published row per domain.
 */
class SiteDesign extends BaseModel_1.BaseModel {
    static tableName = 'tblsite_design';
    static idColumn = 'site_design_id';
    site_design_id;
    domain_id;
    design; // JSON string
    status; // 0 = draft, 1 = published
    /** The published design row for a domain (if any). */
    static async getPublishedByDomain(domainId) {
        return this.query().where('domain_id', domainId).where('status', 1).first();
    }
    /** The parsed published design object for a domain, or null when none/invalid. */
    static async getPublishedConfig(domainId) {
        const row = await this.getPublishedByDomain(domainId);
        if (!row || !row.design)
            return null;
        try {
            return JSON.parse(row.design);
        }
        catch {
            return null;
        }
    }
}
exports.SiteDesign = SiteDesign;
//# sourceMappingURL=SiteDesign.js.map