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
const ctrl = __importStar(require("../controllers/domain.controller"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const common_schema_1 = require("../validators/common.schema");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.requireAuth);
router.get('/', auth_1.requireSuperAdmin, (0, validate_1.validate)(common_schema_1.paginationSchema), ctrl.listDomains);
router.post('/', auth_1.requireSuperAdmin, ctrl.createDomain);
router.post('/register', ctrl.registerDomain);
router.get('/:domainId', ctrl.getDomain);
router.put('/:domainId', ctrl.updateDomain);
router.put('/:domainId/status', auth_1.requireSuperAdmin, ctrl.updateDomainStatus);
router.delete('/:domainId/cache', ctrl.clearDomainCacheController);
exports.default = router;
//# sourceMappingURL=domain.routes.js.map