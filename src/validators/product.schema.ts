import { z } from 'zod';

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

const photoField = z.string().max(500).optional();
const featureItem = z.string().max(1000);

export const createProductSchema = z.object({
  params: z.object({
    contentId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().min(1).max(500),
    price: z.coerce.number().min(0).optional(),
    currency: z.string().max(20).optional(),
    shortdes: z.string().max(5000).optional(),
    longdes: z.string().max(500000).optional(),
    features: z.array(featureItem).max(100).optional(),
    photos: z.array(photoField).max(50).optional(),
    publish: z.string().max(50).optional(),
    priority: z.coerce.number().int().min(0).max(4).default(0),
    status: z.coerce.number().int().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    contentId: z.coerce.number().int().positive(),
    productId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().min(1).max(500).optional(),
    price: z.coerce.number().min(0).optional(),
    currency: z.string().max(20).optional(),
    shortdes: z.string().max(5000).optional(),
    longdes: z.string().max(500000).optional(),
    features: z.array(featureItem).max(100).optional(),
    photos: z.array(photoField).max(50).optional(),
    publish: z.string().max(50).optional(),
    priority: z.coerce.number().int().min(0).max(4).optional(),
    status: z.coerce.number().int().optional(),
  }),
});
