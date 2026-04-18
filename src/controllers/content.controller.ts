import { Request, Response, NextFunction } from 'express';
import * as contentService from '../services/content.service';
import * as newsService from '../services/news.service';

// Content
export async function listContent(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = req.user!.domainId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const result = await contentService.listContent(domainId, page, limit, search);
    res.json({ status: true, data: result });
  } catch (err) { next(err); }
}

export async function getContent(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const content = await contentService.getContent(contentId, req.user!.domainId);
    res.json({ status: true, data: content });
  } catch (err) { next(err); }
}

export async function createContent(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.createContent(req.body, req.user!.userId, req.user!.domainId);
    res.status(201).json({ status: true, data: content });
  } catch (err) { next(err); }
}

export async function updateContent(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const content = await contentService.updateContent(contentId, req.body, req.user!.domainId);
    res.json({ status: true, data: content });
  } catch (err) { next(err); }
}

export async function deleteContent(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    await contentService.deleteContent(contentId, req.user!.domainId);
    res.json({ status: true, message: 'Content deleted' });
  } catch (err) { next(err); }
}

// Content Items
export async function listItems(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const items = await contentService.listItems(contentId, req.user!.domainId);
    res.json({ status: true, data: items });
  } catch (err) { next(err); }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const item = await contentService.createItem(contentId, req.body, req.user!.userId, req.user!.domainId);
    res.status(201).json({ status: true, data: item });
  } catch (err) { next(err); }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const itemId = parseInt(req.params.itemId);
    const item = await contentService.updateItem(itemId, req.body, req.user!.domainId);
    res.json({ status: true, data: item });
  } catch (err) { next(err); }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    const itemId = parseInt(req.params.itemId);
    await contentService.deleteItem(itemId, req.user!.domainId);
    res.json({ status: true, message: 'Item deleted' });
  } catch (err) { next(err); }
}

// Map
export async function updateMap(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    await contentService.updateMap(contentId, req.body, req.user!.domainId);
    res.json({ status: true, message: 'Map updated' });
  } catch (err) { next(err); }
}

// News
export async function listNews(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await newsService.listNews(contentId, req.user!.domainId, page, limit);
    res.json({ status: true, data: result });
  } catch (err) { next(err); }
}

export async function getNews(req: Request, res: Response, next: NextFunction) {
  try {
    const newsId = parseInt(req.params.newsId);
    const news = await newsService.getNews(newsId);
    res.json({ status: true, data: news });
  } catch (err) { next(err); }
}

export async function createNews(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const news = await newsService.createNews(contentId, req.body, req.user!.userId, req.user!.domainId);
    res.status(201).json({ status: true, data: news });
  } catch (err) { next(err); }
}

export async function updateNews(req: Request, res: Response, next: NextFunction) {
  try {
    const newsId = parseInt(req.params.newsId);
    const news = await newsService.updateNews(newsId, req.body, req.user!.userId, req.user!.domainId);
    res.json({ status: true, data: news });
  } catch (err) { next(err); }
}

export async function deleteNews(req: Request, res: Response, next: NextFunction) {
  try {
    const newsId = parseInt(req.params.newsId);
    await newsService.deleteNews(newsId, req.user!.domainId);
    res.json({ status: true, message: 'News deleted' });
  } catch (err) { next(err); }
}
