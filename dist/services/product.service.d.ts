import { Product } from '../models/Product';
export interface ProductInput {
    name: string;
    price?: number;
    currency?: string;
    shortdes?: string;
    longdes?: string;
    features?: string[];
    photos?: string[];
    publish?: string;
    priority?: number;
    status?: number;
}
export declare function listProducts(contentId: number, domainId: number, page: number, limit: number): Promise<{
    items: Product[];
    pagination: import("../types/api").PaginationMeta;
}>;
export declare function getProduct(productId: number): Promise<Product>;
export declare function createProduct(contentId: number, data: ProductInput, userId: number, domainId: number): Promise<Product>;
export declare function updateProduct(productId: number, data: Record<string, any>, domainId: number): Promise<Product | undefined>;
export declare function deleteProduct(productId: number, domainId: number): Promise<void>;
//# sourceMappingURL=product.service.d.ts.map