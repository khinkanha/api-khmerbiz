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
const express_1 = require("express");
const ctrl = __importStar(require("../controllers/user.controller"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const user_schema_1 = require("../validators/user.schema");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.requireAuth);
router.get('/me', ctrl.getProfile);
router.put('/me', (0, validate_1.validate)(user_schema_1.updateProfileSchema), ctrl.updateProfile);
router.put('/me/password', (0, validate_1.validate)(user_schema_1.changePasswordSchema), ctrl.changePassword);
router.get('/', auth_1.requireWebAdmin, ctrl.listUsers);
router.post('/', auth_1.requireWebAdmin, (0, validate_1.validate)(user_schema_1.createUserSchema), ctrl.createUser);
router.get('/:userId', auth_1.requireWebAdmin, ctrl.getUser);
router.put('/:userId', auth_1.requireWebAdmin, ctrl.updateUser);
router.put('/:userId/password', auth_1.requireWebAdmin, ctrl.resetUserPassword);
router.put('/:userId/domain', auth_1.requireSuperAdmin, (0, validate_1.validate)(user_schema_1.assignDomainSchema), ctrl.assignDomain);
router.put('/:userId/verify', auth_1.requireSuperAdmin, (0, validate_1.validate)(user_schema_1.verifyUserSchema), ctrl.verifyUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map