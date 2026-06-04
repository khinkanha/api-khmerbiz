"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.updateGeneral = updateGeneral;
exports.updateMenuSetting = updateMenuSetting;
exports.updateBannerSetting = updateBannerSetting;
exports.updateLogo = updateLogo;
exports.listSocialMedia = listSocialMedia;
exports.addSocialMedia = addSocialMedia;
exports.deleteSocialMedia = deleteSocialMedia;
exports.listLanguages = listLanguages;
exports.addLanguage = addLanguage;
exports.deleteLanguage = deleteLanguage;
exports.setDefaultLanguage = setDefaultLanguage;
const Setting_1 = require("../models/Setting");
const SocialMedia_1 = require("../models/SocialMedia");
const Language_1 = require("../models/Language");
const errors_1 = require("../utils/errors");
const cache_1 = require("../middleware/cache");
const upload_helper_1 = require("../utils/upload-helper");
async function getSettings(req, res, next) {
    try {
        const settings = await Setting_1.Setting.getByDomain(req.user.domainId);
        if (!settings)
            throw new errors_1.NotFoundError('Settings not found');
        res.json({ status: true, data: settings });
    }
    catch (err) {
        next(err);
    }
}
async function updateGeneral(req, res, next) {
    try {
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        const { key: background } = await (0, upload_helper_1.resolveFileField)(req.file, req.body.background || req.body.existing_background, 'background');
        const patchData = {};
        if (req.body.title !== undefined)
            patchData.title = req.body.title;
        if (req.body.footer !== undefined)
            patchData.footer = req.body.footer;
        if (req.body.theme !== undefined)
            patchData.theme = req.body.theme;
        if (req.body.page_style !== undefined)
            patchData.page_style = req.body.page_style;
        if (req.body.screen_mode !== undefined)
            patchData.screen_mode = req.body.screen_mode;
        if (req.body.tracking_id !== undefined)
            patchData.tracking_id = req.body.tracking_id;
        if (req.body.chat_script !== undefined)
            patchData.chat_script = req.body.chat_script;
        if (background !== undefined)
            patchData.background = background;
        await Setting_1.Setting.query().patch(patchData).where('domain_id', req.user.domainId);
        const settings = await Setting_1.Setting.getByDomain(req.user.domainId);
        res.json({ status: true, data: settings });
    }
    catch (err) {
        next(err);
    }
}
async function updateMenuSetting(req, res, next) {
    try {
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        await Setting_1.Setting.query().patch(req.body).where('domain_id', req.user.domainId);
        res.json({ status: true, message: 'Menu settings updated' });
    }
    catch (err) {
        next(err);
    }
}
async function updateBannerSetting(req, res, next) {
    try {
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        await Setting_1.Setting.query().patch(req.body).where('domain_id', req.user.domainId);
        res.json({ status: true, message: 'Banner settings updated' });
    }
    catch (err) {
        next(err);
    }
}
async function updateLogo(req, res, next) {
    try {
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        const files = req.files;
        const { key: logo } = await (0, upload_helper_1.resolveFileField)(files?.logo?.[0], req.body.logo || req.body.existing_logo, 'logo');
        const { key: mobileLogo } = await (0, upload_helper_1.resolveFileField)(files?.mobile_logo?.[0], req.body.mobile_logo || req.body.existing_mobile_logo, 'logo/mobile');
        const patchData = {};
        if (logo !== undefined)
            patchData.logo = logo;
        if (mobileLogo !== undefined)
            patchData.mobile_logo = mobileLogo;
        if (req.body.logo_position !== undefined)
            patchData.logo_position = req.body.logo_position;
        if (req.body.logo_align !== undefined)
            patchData.logo_align = req.body.logo_align;
        await Setting_1.Setting.query().patch(patchData).where('domain_id', req.user.domainId);
        res.json({ status: true, message: 'Logo updated' });
    }
    catch (err) {
        next(err);
    }
}
// Social Media
async function listSocialMedia(req, res, next) {
    try {
        const items = await SocialMedia_1.SocialMedia.listByDomain(req.user.domainId);
        res.json({ status: true, data: items });
    }
    catch (err) {
        next(err);
    }
}
async function addSocialMedia(req, res, next) {
    try {
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        const item = await SocialMedia_1.SocialMedia.query().insert({
            ...req.body,
            domain_id: req.user.domainId,
        });
        res.status(201).json({ status: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function deleteSocialMedia(req, res, next) {
    try {
        const smid = parseInt(req.params.smid);
        await SocialMedia_1.SocialMedia.query().deleteById(smid);
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        res.json({ status: true, message: 'Social media link deleted' });
    }
    catch (err) {
        next(err);
    }
}
// Languages
async function listLanguages(req, res, next) {
    try {
        const items = await Language_1.Language.listByDomain(req.user.domainId);
        res.json({ status: true, data: items });
    }
    catch (err) {
        next(err);
    }
}
async function addLanguage(req, res, next) {
    try {
        const count = await Language_1.Language.countByDomain(req.user.domainId);
        if (count >= 2)
            throw new errors_1.BadRequestError('Maximum 2 languages allowed');
        // Check if flag already exists for this domain
        const existing = await Language_1.Language.query()
            .where('flag', req.body.flag)
            .where('domain_id', req.user.domainId)
            .first();
        if (existing)
            throw new errors_1.BadRequestError('Language flag already exists');
        const is_default = count === 0 ? 1 : 0;
        const item = await Language_1.Language.query().insert({
            ...req.body,
            domain_id: req.user.domainId,
            is_default,
        });
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        res.status(201).json({ status: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function deleteLanguage(req, res, next) {
    try {
        const langId = parseInt(req.params.langId);
        await Language_1.Language.query().deleteById(langId);
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        res.json({ status: true, message: 'Language deleted' });
    }
    catch (err) {
        next(err);
    }
}
async function setDefaultLanguage(req, res, next) {
    try {
        const langId = parseInt(req.params.langId);
        // Reset all defaults for this domain
        await Language_1.Language.query().patch({ is_default: 0 }).where('domain_id', req.user.domainId);
        // Set new default
        await Language_1.Language.query().patch({ is_default: 1 }).where('lang_id', langId);
        await (0, cache_1.invalidateDomainCache)(req.user.domainId);
        res.json({ status: true, message: 'Default language set' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=setting.controller.js.map