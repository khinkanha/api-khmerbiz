import { BaseModel } from './BaseModel';
/**
 * A tenant's full Site Designer document (colors/fonts + header/footer/page
 * composition). The `design` column stores the SiteDesign JSON as a string
 * (utf8mb4 so Khmer/Chinese survive). One published row per domain.
 */
export declare class SiteDesign extends BaseModel {
    static tableName: string;
    static idColumn: string;
    site_design_id: number;
    domain_id: number;
    design: string | null;
    status: number;
    /** The published design row for a domain (if any). */
    static getPublishedByDomain(domainId: number): Promise<SiteDesign | undefined>;
    /** The parsed published design object for a domain, or null when none/invalid. */
    static getPublishedConfig(domainId: number): Promise<any | null>;
}
//# sourceMappingURL=SiteDesign.d.ts.map