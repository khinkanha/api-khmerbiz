"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBanners = listBanners;
exports.addBanner = addBanner;
exports.deleteBanner = deleteBanner;
const Banner_1 = require("../models/Banner");
const errors_1 = require("../utils/errors");
const cache_1 = require("../middleware/cache");
async function listBanners(req, res, next) {
    try {
        const banners = await Banner_1.Banner.listByDomain(req.user.domainId);
        res.json({ status: true, data: banners });
    }
    catch (err) {
        next(err);
    }
}
async function addBanner(req, res, next) {
    try {
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        const banner = await Banner_1.Banner.query().insert({
            ...req.body,
            domain_id: req.user.domainId,
        });
        res.status(201).json({ status: true, data: banner });
    }
    catch (err) {
        next(err);
    }
}
async function deleteBanner(req, res, next) {
    try {
        const bannerId = parseInt(req.params.bannerId);
        const banner = await Banner_1.Banner.query().findById(bannerId);
        if (!banner || banner.domain_id !== req.user.domainId) {
            throw new errors_1.NotFoundError('Banner not found');
        }
        await Banner_1.Banner.query().deleteById(bannerId);
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        res.json({ status: true, message: 'Banner deleted' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=banner.controller.js.map