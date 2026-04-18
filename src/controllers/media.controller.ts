import { Request, Response, NextFunction } from 'express';
import * as mediaService from '../services/media.service';

export async function listMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const result = await mediaService.listMedia(req.user!.domainId, page, limit, search);
    res.json({ status: true, data: result });
  } catch (err) { next(err); }
}

export async function requestUploadUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { fileName, fileType, folder } = req.body;
    const result = await mediaService.requestUploadUrl(fileName, fileType, folder || 'photos', req.user!.domainId);
    res.json({ status: true, data: result });
  } catch (err) { next(err); }
}

export async function confirmUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const { key, originalName, title } = req.body;
    const media = await mediaService.confirmUpload(key, originalName, title, req.user!.domainId, req.user!.userId);
    res.status(201).json({ status: true, data: media });
  } catch (err) { next(err); }
}

export async function getMediaUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { Media } = await import('../models/Media');
    const mediaId = parseInt(req.params.mediaId);
    const media = await Media.query().findById(mediaId);
    if (!media || media.domain_id !== req.user!.domainId) {
      return res.status(404).json({ status: false, message: 'Media not found' });
    }
    const url = mediaService.getMediaUrl(media.file_name!);
    res.json({ status: true, data: { url } });
  } catch (err) { next(err); }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const { Media } = await import('../models/Media');
    const mediaId = parseInt(req.params.mediaId);
    const media = await Media.query().findById(mediaId);
    if (!media || media.domain_id !== req.user!.domainId) {
      return res.status(404).json({ status: false, message: 'Media not found' });
    }
    await Media.query().deleteById(mediaId);
    res.json({ status: true, message: 'Media deleted' });
  } catch (err) { next(err); }
}
