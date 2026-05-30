"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const domain_routes_1 = __importDefault(require("./domain.routes"));
const content_routes_1 = __importDefault(require("./content.routes"));
const menu_routes_1 = __importDefault(require("./menu.routes"));
const banner_routes_1 = __importDefault(require("./banner.routes"));
const media_routes_1 = __importDefault(require("./media.routes"));
const setting_routes_1 = __importDefault(require("./setting.routes"));
const website_routes_1 = __importDefault(require("./website.routes"));
const aiChat_routes_1 = __importDefault(require("./aiChat.routes"));
const setup_routes_1 = __importDefault(require("./setup.routes"));
const router = (0, express_1.Router)();
// Health check
router.get('/health', (_req, res) => {
    res.json({ status: true, message: 'API is running', timestamp: new Date().toISOString() });
});
// Auth
router.use('/auth', auth_routes_1.default);
// Protected routes
router.use('/users', user_routes_1.default);
router.use('/domains', domain_routes_1.default);
router.use('/content', content_routes_1.default);
router.use('/menus', menu_routes_1.default);
router.use('/banners', banner_routes_1.default);
router.use('/media', media_routes_1.default);
router.use('/settings', setting_routes_1.default);
router.use('/setup', setup_routes_1.default);
router.use('/ai-chat', aiChat_routes_1.default);
// Public website data
router.use('/site', website_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map