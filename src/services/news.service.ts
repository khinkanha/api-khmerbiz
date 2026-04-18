import { News } from '../models/News';
import { NotFoundError } from '../utils/errors';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { invalidateDomainCache } from '../middleware/cache';
import { stringifyDescription } from '../utils/content-description';
import { Content } from '../models/Content';

export async function listNews(contentId: number, domainId: number, page: number, limit: number) {
  // Verify content belongs to domain
  const content = await Content.query().where('content_id', contentId).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  const { offset, limit: safeLimit } = getPagination(page, limit);

  const [items, countResult] = await Promise.all([
    News.query()
      .where('content_id', contentId)
      .where('status', '!=', 2)
      .orderBy('publish_date', 'desc')
      .limit(safeLimit)
      .offset(offset)
      .withGraphFetched('author'),
    News.query().where('content_id', contentId).where('status', '!=', 2).count('id as count').first(),
  ]);

  const total = Number((countResult as any)?.count) || 0;
  return { items, pagination: buildPaginationMeta(page, safeLimit, total) };
}

export async function getNews(newsId: number) {
  const news = await News.query().findById(newsId).withGraphFetched('author');
  if (!news || news.status === 2) throw new NotFoundError('News not found');
  return news;
}

export async function createNews(contentId: number, data: { title: string; shortdes?: string; longdes?: string; photo?: string; publish?: string; priority?: number }, userId: number, domainId: number) {
  const content = await Content.query().where('content_id', contentId).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);
  return News.query().insert({
    content_id: contentId,
    description: stringifyDescription(data),
    userid: userId,
    status: 0,
    priority: data.priority || 0,
    publish_date: data.publish || new Date().toISOString(),
  });
}

export async function updateNews(newsId: number, data: Record<string, any>, userId: number, domainId: number) {
  const news = await News.query().findById(newsId);
  if (!news || news.status === 2) throw new NotFoundError('News not found');

  // Verify content belongs to domain
  const content = await Content.query().where('content_id', news.content_id).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);

  const updateData: Record<string, any> = {};
  if (Object.keys(data).some(k => ['title', 'shortdes', 'longdes', 'photo', 'publish'].includes(k))) {
    const existing = news.description ? JSON.parse(news.description) : {};
    updateData.description = JSON.stringify({ ...existing, ...data });
  }
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.publish !== undefined) updateData.publish_date = data.publish;

  await News.query().patch(updateData).where('id', newsId);
  return News.query().findById(newsId).withGraphFetched('author');
}

export async function deleteNews(newsId: number, domainId: number) {
  const news = await News.query().findById(newsId);
  if (!news || news.status === 2) throw new NotFoundError('News not found');

  const content = await Content.query().where('content_id', news.content_id).where('domain_id', domainId).first();
  if (!content) throw new NotFoundError('Content not found');

  await invalidateDomainCache(domainId);
  await News.query().patch({ status: 2 }).where('id', newsId);
}
