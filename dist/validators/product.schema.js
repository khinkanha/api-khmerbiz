"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
/**
 * Validators for the product/service catalog feature.
 * Detail fields are stored as JSON in the `description` column of
 * tblproduct, mirroring the News pattern.
 *
 *   name      — product/service name (required on create)
 *   price     — numeric price, >= 0 (optional — services may omit)
 *   currency  — ISO-ish currency code, e.g. USD, KHR
 *   shortdes  — short description / summary
 *   longdes   — full description (HTML allowed)
 *   features  — list of feature bullets
 *   photos    — list of S3 keys (photo collection)
 */
const photoField = zod_1.z.string().max(500).optional();
const featureItem = zod_1.z.string().max(1000);
exports.createProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        contentId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(500),
        price: zod_1.z.coerce.number().min(0).optional(),
        currency: zod_1.z.string().max(20).optional(),
        shortdes: zod_1.z.string().max(5000).optional(),
        longdes: zod_1.z.string().max(500000).optional(),
        features: zod_1.z.array(featureItem).max(100).optional(),
        photos: zod_1.z.array(photoField).max(50).optional(),
        publish: zod_1.z.string().max(50).optional(),
        priority: zod_1.z.coerce.number().int().min(0).max(4).default(0),
        status: zod_1.z.coerce.number().int().optional(),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        contentId: zod_1.z.coerce.number().int().positive(),
        productId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(500).optional(),
        price: zod_1.z.coerce.number().min(0).optional(),
        currency: zod_1.z.string().max(20).optional(),
        shortdes: zod_1.z.string().max(5000).optional(),
        longdes: zod_1.z.string().max(500000).optional(),
        features: zod_1.z.array(featureItem).max(100).optional(),
        photos: zod_1.z.array(photoField).max(50).optional(),
        publish: zod_1.z.string().max(50).optional(),
        priority: zod_1.z.coerce.number().int().min(0).max(4).optional(),
        status: zod_1.z.coerce.number().int().optional(),
    }),
});
//# sourceMappingURL=product.schema.js.map