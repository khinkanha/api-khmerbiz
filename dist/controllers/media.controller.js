"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMedia = listMedia;
exports.requestUploadUrl = requestUploadUrl;
exports.confirmUpload = confirmUpload;
exports.getMediaUrl = getMediaUrl;
exports.deleteMedia = deleteMedia;
exports.uploadFile = uploadFile;
const mediaService = __importStar(require("../services/media.service"));
async function listMedia(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const result = await mediaService.listMedia(req.user.domainId, page, limit, search);
        res.json({ status: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function requestUploadUrl(req, res, next) {
    try {
        const { fileName, fileType, folder } = req.body;
        const result = await mediaService.requestUploadUrl(fileName, fileType, folder || 'photos', req.user.domainId);
        res.json({ status: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function confirmUpload(req, res, next) {
    try {
        const { key, originalName, title } = req.body;
        const media = await mediaService.confirmUpload(key, originalName, title, req.user.domainId, req.user.userId);
        res.status(201).json({ status: true, data: media });
    }
    catch (err) {
        next(err);
    }
}
async function getMediaUrl(req, res, next) {
    try {
        const { Media } = await Promise.resolve().then(() => __importStar(require('../models/Media')));
        const mediaId = parseInt(req.params.mediaId);
        const media = await Media.query().findById(mediaId);
        if (!media || media.domain_id !== req.user.domainId) {
            return res.status(404).json({ status: false, message: 'Media not found' });
        }
        const url = mediaService.getMediaUrl(media.file_name);
        res.json({ status: true, data: { url } });
    }
    catch (err) {
        next(err);
    }
}
async function deleteMedia(req, res, next) {
    try {
        const { Media } = await Promise.resolve().then(() => __importStar(require('../models/Media')));
        const mediaId = parseInt(req.params.mediaId);
        const media = await Media.query().findById(mediaId);
        if (!media || media.domain_id !== req.user.domainId) {
            return res.status(404).json({ status: false, message: 'Media not found' });
        }
        await Media.query().deleteById(mediaId);
        res.json({ status: true, message: 'Media deleted' });
    }
    catch (err) {
        next(err);
    }
}
async function uploadFile(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ status: false, message: 'No file provided' });
        }
        const media = await mediaService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, req.body.title, req.user.domainId);
        res.status(201).json({ status: true, data: media });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=media.controller.js.map