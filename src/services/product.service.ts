import { Product } from '../models/Product';
import { Content } from '../models/Content';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { invalidateDomainCache } from '../middleware/cache';
import { stringifyDescription } from '../utils/content-description';

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

// Detail fields persisted as JSON in Product.description
const DETAIL_KEYS = ['name', 'price', 'currency', 'shortdes', 'longdes', 'features', 'photos', 'publish'];

export async function listProducts(contentId: number, domainId: number, page: number, limit: number) {
  // Verify content belongs to domain
  const content = await Content.query().where('content_id', contentId).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  const { offset, limit: safeLimit } = getPagination(page, limit);

  const [items, countResult] = await Promise.all([
    Product.query()
      .where('content_id', contentId)
      .where('status', '!=', 2)
      .orderBy('priority', 'desc')
      .orderBy('id', 'desc')
      .limit(safeLimit)
      .offset(offset)
      .withGraphFetched('author'),
    Product.query().where('content_id', contentId).where('status', '!=', 2).count('id as count').first(),
  ]);

  const total = Number((countResult as any)?.count) || 0;
  return { items, pagination: buildPaginationMeta(page, safeLimit, total) };
}

export async function getProduct(productId: number) {
  const product = await Product.query().findById(productId).withGraphFetched('author');
  if (!product || product.status === 2) throw new NotFoundError('Product not found');
  return product;
}

export async function createProduct(contentId: number, data: ProductInput, userId: number, domainId: number) {
  const content = await Content.query().where('content_id', contentId).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');
  if (content.content_type !== Content.TYPE_PRODUCT) {
    throw new BadRequestError('Content is not a product/service catalog');
  }

  await invalidateDomainCache(domainId);
  return Product.query().insert({
    content_id: contentId,
    description: stringifyDescription(data as unknown as Record<string, unknown>),
    userid: userId,
    status: data.status !== undefined ? data.status : 0,
    priority: data.priority || 0,
    publish_date: data.publish || new Date().toISOString().slice(0, 19).replace('T', ' '),
  });
}

export async function updateProduct(productId: number, data: Record<string, any>, domainId: number) {
  const product = await Product.query().findById(productId);
  if (!product || product.status === 2) throw new NotFoundError('Product not found');

  // Verify ownership through the parent content
  const content = await Content.query().where('content_id', product.content_id).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);

  const updateData: Record<string, any> = {};
  if (Object.keys(data).some(k => DETAIL_KEYS.includes(k))) {
    const existing = product.description ? JSON.parse(product.description) : {};
    updateData.description = JSON.stringify({ ...existing, ...data });
  }
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.publish !== undefined) updateData.publish_date = data.publish;

  await Product.query().patch(updateData).where('id', productId);
  return Product.query().findById(productId).withGraphFetched('author');
}

export async function deleteProduct(productId: number, domainId: number) {
  const product = await Product.query().findById(productId);
  if (!product || product.status === 2) throw new NotFoundError('Product not found');

  const content = await Content.query().where('content_id', product.content_id).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);
  await Product.query().patch({ status: 2 }).where('id', productId);
}
