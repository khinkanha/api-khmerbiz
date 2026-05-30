import { Domain } from '../models/Domain';
export declare function resolveDomain(hostName: string): Promise<Domain | null>;
export declare function getDomainConfig(domainId: number): Promise<{
    domain: Domain | undefined;
    settings: import("../models/Setting").Setting | undefined;
    languages: import("../models/Language").Language[];
    socialMedia: import("../models/SocialMedia").SocialMedia[];
    banners: import("../models/Banner").Banner[];
}>;
export declare function clearDomainCache(domainId: number): Promise<void>;
//# sourceMappingURL=domain.service.d.ts.map