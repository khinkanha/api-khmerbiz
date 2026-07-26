import { BaseModel } from './BaseModel';

/**
 * A tenant's full Site Designer document (colors/fonts + header/footer/page
 * composition). The `design` column stores the SiteDesign JSON as a string
 * (utf8mb4 so Khmer/Chinese survive). One published row per domain.
 */
export class SiteDesign extends BaseModel {
  static tableName = 'tblsite_design';
  static idColumn = 'site_design_id';

  site_design_id!: number;
  domain_id!: number;
  design!: string | null; // JSON string
  status!: number; // 0 = draft, 1 = published

  /** The published design row for a domain (if any). */
  static async getPublishedByDomain(domainId: number): Promise<SiteDesign | undefined> {
    return this.query().where('domain_id', domainId).where('status', 1).first();
  }

  /** The parsed published design object for a domain, or null when none/invalid. */
  static async getPublishedConfig(domainId: number): Promise<any | null> {
    const row = await this.getPublishedByDomain(domainId);
    if (!row || !row.design) return null;
    try {
      return JSON.parse(row.design);
    } catch {
      return null;
    }
  }
}
