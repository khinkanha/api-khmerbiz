"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAuth = requireAuth;
exports.requireSuperAdmin = requireSuperAdmin;
exports.requireWebAdmin = requireWebAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../config/index");
const errors_1 = require("../utils/errors");
function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return next(new errors_1.UnauthorizedError('No token provided'));
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, index_1.config.jwt.secret);
        if (decoded.type !== 'access') {
            return next(new errors_1.UnauthorizedError('Invalid token type'));
        }
        req.user = {
            userId: decoded.sub,
            username: decoded.username,
            domainId: decoded.domainId,
            userLevel: decoded.userLevel,
            sitebuilder: decoded.sitebuilder,
        };
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errors_1.UnauthorizedError('Token expired'));
        }
        return next(new errors_1.UnauthorizedError('Invalid token'));
    }
}
function requireAuth(req, _res, next) {
    if (!req.user) {
        return next(new errors_1.UnauthorizedError('Authentication required'));
    }
    next();
}
function requireSuperAdmin(req, _res, next) {
    if (!req.user) {
        return next(new errors_1.UnauthorizedError('Authentication required'));
    }
    if (req.user.userLevel !== -1) {
        return next(new errors_1.UnauthorizedError('Super Admin access required'));
    }
    next();
}
function requireWebAdmin(req, _res, next) {
    if (!req.user) {
        return next(new errors_1.UnauthorizedError('Authentication required'));
    }
    if (req.user.userLevel > 1) {
        return next(new errors_1.UnauthorizedError('Admin access required'));
    }
    next();
}
//# sourceMappingURL=auth.js.map