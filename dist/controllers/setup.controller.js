"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSetupStatus = getSetupStatus;
const Language_1 = require("../models/Language");
const MenuItem_1 = require("../models/MenuItem");
const Content_1 = require("../models/Content");
const Setting_1 = require("../models/Setting");
async function getSetupStatus(req, res, next) {
    try {
        const domainId = req.user.domainId;
        const [language, menuCount, contentCount, settings] = await Promise.all([
            Language_1.Language.query().where('domain_id', domainId).first(),
            MenuItem_1.MenuItem.query().where('domain_id', domainId).resultSize(),
            Content_1.Content.query().where('domain_id', domainId).where('status', '!=', 2).resultSize(),
            Setting_1.Setting.getByDomain(domainId),
        ]);
        const menus = menuCount > 0
            ? await MenuItem_1.MenuItem.query().where('domain_id', domainId).where('parent_id', 0).orderBy('item_order', 'asc')
            : [];
        res.json({
            status: true,
            data: {
                hasLanguage: !!language,
                language,
                hasMenus: menuCount > 0,
                menuCount,
                menus,
                hasContent: contentCount > 0,
                contentCount,
                hasBasicSettings: !!(settings?.title),
                settings: settings ? { title: settings.title, logo: settings.logo } : null,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=setup.controller.js.map