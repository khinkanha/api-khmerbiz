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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ctrl = __importStar(require("../controllers/setting.controller"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const upload_1 = __importDefault(require("../middleware/upload"));
const setting_schema_1 = require("../validators/setting.schema");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.requireAuth);
router.get('/', ctrl.getSettings);
router.put('/general', upload_1.default.single('background'), (0, validate_1.validate)(setting_schema_1.updateGeneralSchema), ctrl.updateGeneral);
router.put('/menu', (0, validate_1.validate)(setting_schema_1.updateMenuSettingSchema), ctrl.updateMenuSetting);
router.put('/banner', (0, validate_1.validate)(setting_schema_1.updateBannerSettingSchema), ctrl.updateBannerSetting);
router.put('/logo', upload_1.default.fields([{ name: 'logo', maxCount: 1 }, { name: 'mobile_logo', maxCount: 1 }]), (0, validate_1.validate)(setting_schema_1.updateLogoSchema), ctrl.updateLogo);
// Social Media
router.get('/social-media', ctrl.listSocialMedia);
router.post('/social-media', (0, validate_1.validate)(setting_schema_1.addSocialMediaSchema), ctrl.addSocialMedia);
router.delete('/social-media/:smid', ctrl.deleteSocialMedia);
// Languages
router.get('/languages', ctrl.listLanguages);
router.post('/languages', (0, validate_1.validate)(setting_schema_1.addLanguageSchema), ctrl.addLanguage);
router.delete('/languages/:langId', ctrl.deleteLanguage);
router.put('/languages/:langId/default', ctrl.setDefaultLanguage);
exports.default = router;
//# sourceMappingURL=setting.routes.js.map