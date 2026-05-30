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
exports.login = login;
exports.signup = signup;
exports.verifyAccount = verifyAccount;
exports.refreshToken = refreshToken;
exports.logout = logout;
const authService = __importStar(require("../services/auth.service"));
const errors_1 = require("../utils/errors");
async function login(req, res, next) {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.json({ status: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function signup(req, res, next) {
    try {
        const result = await authService.signup(req.body);
        res.status(201).json({
            status: true,
            data: { userid: result.userid, domain_name: result.domain_name },
            message: result.domain_name ? 'Account and domain created.' : 'Account created.',
        });
    }
    catch (err) {
        next(err);
    }
}
async function verifyAccount(req, res, next) {
    try {
        await authService.verifyAccount(req.body.username, req.body.code);
        res.json({ status: true, message: 'Account verified' });
    }
    catch (err) {
        next(err);
    }
}
async function refreshToken(req, res, next) {
    try {
        const result = await authService.refreshAccessToken(req.body.refreshToken);
        res.json({ status: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function logout(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.BadRequestError('Not authenticated');
        await authService.logout(req.user.userId, req.body.refreshToken || '');
        res.json({ status: true, message: 'Logged out' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map