import { Router } from 'express';
import * as ctrl from '../controllers/setting.controller';
import { authenticate, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import upload from '../middleware/upload';
import { updateGeneralSchema, updateMenuSettingSchema, updateBannerSettingSchema, updateLogoSchema, addSocialMediaSchema, addLanguageSchema } from '../validators/setting.schema';

const router = Router();

router.use(authenticate, requireAuth);

router.get('/', ctrl.getSettings);
router.put('/general', upload.single('background'), validate(updateGeneralSchema), ctrl.updateGeneral);
router.put('/menu', validate(updateMenuSettingSchema), ctrl.updateMenuSetting);
router.put('/banner', validate(updateBannerSettingSchema), ctrl.updateBannerSetting);
router.put('/logo', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'mobile_logo', maxCount: 1 }]), validate(updateLogoSchema), ctrl.updateLogo);

// Social Media
router.get('/social-media', ctrl.listSocialMedia);
router.post('/social-media', validate(addSocialMediaSchema), ctrl.addSocialMedia);
router.delete('/social-media/:smid', ctrl.deleteSocialMedia);

// Languages
router.get('/languages', ctrl.listLanguages);
router.post('/languages', validate(addLanguageSchema), ctrl.addLanguage);
router.delete('/languages/:langId', ctrl.deleteLanguage);
router.put('/languages/:langId/default', ctrl.setDefaultLanguage);

export default router;
