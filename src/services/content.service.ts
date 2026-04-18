import { Content } from '../models/Content';
import { ContentItem } from '../models/ContentItem';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { invalidateDomainCache } from '../middleware/cache';

export async function listContent(domainId: number, page: number, limit: number, search?: string) {
  const { offset, limit: safeLimit } = getPagination(page, limit);
  let query = Content.query()
    .where('domain_id', domainId)
    .where('status', '!=', 2);

  if (search) {
    query = query.where('title', 'like', `%${search}%`);
  }

  const [items, countResult] = await Promise.all([
    query.orderBy('content_id', 'desc').limit(safeLimit).offset(offset),
    Content.query().where('domain_id', domainId).where('status', '!=', 2).count('content_id as count').first(),
  ]);

  const total = (countResult?.count as number) || 0;
  return { items, pagination: buildPaginationMeta(page, safeLimit, total) };
}

export async function getContent(contentId: number, domainId: number) {
  const content = await Content.query()
    .where('content_id', contentId)
    .where('domain_id', domainId)
    .where('status', '!=', 2)
    .withGraphFetched('[items, newsItems]')
    .first();

  if (!content) throw new NotFoundError('Content not found');
  return content;
}

export async function createContent(data: Partial<Content>, userId: number, domainId: number) {
  await invalidateDomainCache(domainId);
  const content = await Content.query().insert({
    ...data,
    domain_id: domainId,
    userid: userId,
    status: 0,
  });
  return content;
}

export async function updateContent(contentId: number, data: Partial<Content>, domainId: number) {
  const content = await Content.query()
    .where('content_id', contentId)
    .where('domain_id', domainId)
    .where('status', '!=', 2)
    .first();

  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);
  await Content.query().patch(data).where('content_id', contentId);
  return Content.query().findById(contentId);
}

export async function deleteContent(contentId: number, domainId: number) {
  const content = await Content.query()
    .where('content_id', contentId)
    .where('domain_id', domainId)
    .first();

  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);
  await Content.query().patch({ menu_id: 0, status: 2 }).where('content_id', contentId);
}

// Content Items
export async function listItems(contentId: number, domainId: number) {
  // Verify content belongs to domain
  const content = await Content.query().where('content_id', contentId).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  return ContentItem.query()
    .where('content_id', contentId)
    .where('status', '!=', 2);
}

export async function createItem(contentId: number, data: Partial<ContentItem>, userId: number, domainId: number) {
  const content = await Content.query().where('content_id', contentId).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);
  return ContentItem.query().insert({
    ...data,
    content_id: contentId,
    upload_by: userId,
    status: 0,
  });
}

export async function updateItem(itemId: number, data: Partial<ContentItem>, domainId: number) {
  const item = await ContentItem.query().findById(itemId);
  if (!item) throw new NotFoundError('Item not found');

  // Verify ownership through content
  const content = await Content.query().where('content_id', item.content_id).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);
  await ContentItem.query().patch(data).where('item_id', itemId);
  return ContentItem.query().findById(itemId);
}

export async function deleteItem(itemId: number, domainId: number) {
  const item = await ContentItem.query().findById(itemId);
  if (!item) throw new NotFoundError('Item not found');

  const content = await Content.query().where('content_id', item.content_id).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);
  await ContentItem.query().patch({ status: 2 }).where('item_id', itemId);
}

// Map
export async function updateMap(contentId: number, data: { title: string; description?: string; lat: number; lng: number; visible: number }, domainId: number) {
  const content = await Content.query().where('content_id', contentId).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');
  if (content.content_type !== Content.TYPE_MAP) throw new BadRequestError('Content is not a map type');

  await invalidateDomainCache(domainId);
  await Content.query().patch({
    description: JSON.stringify(data),
  }).where('content_id', contentId);
}
