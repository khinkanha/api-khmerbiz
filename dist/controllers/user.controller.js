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
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
exports.listUsers = listUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.resetUserPassword = resetUserPassword;
exports.assignDomain = assignDomain;
const User_1 = require("../models/User");
const password_1 = require("../utils/password");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
async function getProfile(req, res, next) {
    try {
        const user = await User_1.User.query().findById(req.user.userId);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        res.json({ status: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function updateProfile(req, res, next) {
    try {
        await User_1.User.query().patch(req.body).where('userid', req.user.userId);
        const user = await User_1.User.query().findById(req.user.userId);
        res.json({ status: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.User.query().findById(req.user.userId);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        const { comparePassword } = await Promise.resolve().then(() => __importStar(require('../utils/password')));
        const { match } = await comparePassword(currentPassword, user.password);
        if (!match)
            throw new errors_1.ForbiddenError('Current password is incorrect');
        const hashed = await (0, password_1.hashPassword)(newPassword);
        await User_1.User.query().patch({ password: hashed }).where('userid', req.user.userId);
        res.json({ status: true, message: 'Password changed' });
    }
    catch (err) {
        next(err);
    }
}
async function listUsers(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { offset, limit: safeLimit } = (0, pagination_1.getPagination)(page, limit);
        // WebAdmin can only see users in their domain
        const domainFilter = req.user.userLevel !== -1 ? req.user.domainId : undefined;
        const [items, countResult] = await Promise.all([
            User_1.User.query()
                .modify(q => { if (domainFilter !== undefined)
                q.where('domain_id', domainFilter); })
                .orderBy('userid').limit(safeLimit).offset(offset),
            User_1.User.query()
                .modify(q => { if (domainFilter !== undefined)
                q.where('domain_id', domainFilter); })
                .count('userid as count').first(),
        ]);
        const total = Number(countResult?.count) || 0;
        res.json({ status: true, data: { items, pagination: (0, pagination_1.buildPaginationMeta)(page, safeLimit, total) } });
    }
    catch (err) {
        next(err);
    }
}
async function getUser(req, res, next) {
    try {
        const userId = parseInt(req.params.userId);
        const user = await User_1.User.query().findById(userId);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        // WebAdmin can only see their domain's users
        if (req.user.userLevel !== -1 && user.domain_id !== req.user.domainId) {
            throw new errors_1.ForbiddenError('Access denied');
        }
        res.json({ status: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function createUser(req, res, next) {
    try {
        const hashedPassword = await (0, password_1.hashPassword)(req.body.password);
        const user = await User_1.User.query().insert({
            username: req.body.username,
            password: hashedPassword,
            full_name: req.body.full_name,
            phone: req.body.phone || '',
            email: req.body.email || '',
            domain_id: req.body.domain_id ?? req.user.domainId,
            user_level: req.body.user_level || 2,
            sitebuilder: 0,
        });
        res.status(201).json({ status: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function updateUser(req, res, next) {
    try {
        const userId = parseInt(req.params.userId);
        const updates = {};
        if (req.body.full_name !== undefined)
            updates.full_name = req.body.full_name;
        if (req.body.phone !== undefined)
            updates.phone = req.body.phone;
        if (req.body.email !== undefined)
            updates.email = req.body.email;
        if (req.body.domain_id !== undefined)
            updates.domain_id = req.body.domain_id;
        if (req.body.user_level !== undefined)
            updates.user_level = req.body.user_level;
        await User_1.User.query().patch(updates).where('userid', userId);
        const user = await User_1.User.query().findById(userId);
        res.json({ status: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function resetUserPassword(req, res, next) {
    try {
        const userId = parseInt(req.params.userId);
        const hashedPassword = await (0, password_1.hashPassword)(req.body.password);
        await User_1.User.query().patch({ password: hashedPassword }).where('userid', userId);
        res.json({ status: true, message: 'Password reset' });
    }
    catch (err) {
        next(err);
    }
}
async function assignDomain(req, res, next) {
    try {
        const userId = parseInt(req.params.userId);
        await User_1.User.query().patch({
            domain_id: req.body.domain_id,
            user_level: req.body.user_level,
        }).where('userid', userId);
        res.json({ status: true, message: 'Domain assigned' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=user.controller.js.map