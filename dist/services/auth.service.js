"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.signup = signup;
exports.verifyAccount = verifyAccount;
exports.refreshAccessToken = refreshAccessToken;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const index_1 = require("../config/index");
const password_1 = require("../utils/password");
const errors_1 = require("../utils/errors");
const redis_1 = require("../config/redis");
function generateAccessToken(user) {
    const payload = {
        sub: user.userid,
        username: user.username,
        domainId: user.domain_id,
        userLevel: user.user_level,
        sitebuilder: user.sitebuilder === 1,
        type: 'access',
    };
    return jsonwebtoken_1.default.sign(payload, index_1.config.jwt.secret, { expiresIn: index_1.config.jwt.accessExpiry });
}
function generateRefreshToken(userId) {
    const payload = { sub: userId, type: 'refresh' };
    return jsonwebtoken_1.default.sign(payload, index_1.config.jwt.secret, { expiresIn: index_1.config.jwt.refreshExpiry });
}
async function login(username, password) {
    // Check failed attempts
    const failKey = `auth:failed:${username}`;
    const failCount = parseInt(await redis_1.redis.get(failKey) || '0', 10);
    if (failCount >= 5) {
        throw new errors_1.ForbiddenError('Account locked. Try again in 30 minutes.');
    }
    const user = await User_1.User.query()
        .where('username', username)
        .withGraphFetched('domain')
        .first();
    if (!user) {
        await redis_1.redis.incr(failKey);
        await redis_1.redis.expire(failKey, 1800);
        throw new errors_1.UnauthorizedError('Invalid username or password');
    }
    // Check verification
    if (user.verify_code) {
        throw new errors_1.ForbiddenError('Please verify your account first');
    }
    // Compare password (handles MD5 migration)
    const { match, needsRehash } = await (0, password_1.comparePassword)(password, user.password);
    if (!match) {
        await redis_1.redis.incr(failKey);
        await redis_1.redis.expire(failKey, 1800);
        throw new errors_1.UnauthorizedError('Invalid username or password');
    }
    // Rehash if MD5 → bcrypt migration needed
    if (needsRehash) {
        const newHash = await (0, password_1.hashPassword)(password);
        await User_1.User.query().patch({ password: newHash }).where('userid', user.userid);
    }
    // Clear failed attempts
    await redis_1.redis.del(failKey);
    // Check domain status
    if (user.domain?.status !== Domain_1.Domain.ACTIVE && user.user_level !== -1) {
        throw new errors_1.ForbiddenError('Domain is suspended or expired');
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.userid);
    // Store refresh token in Redis
    await redis_1.redis.setex(`refresh:${user.userid}:${refreshToken.slice(-20)}`, 7 * 24 * 3600, 'valid');
    return {
        accessToken,
        refreshToken,
        user: {
            userid: user.userid,
            username: user.username,
            full_name: user.full_name,
            domain_id: user.domain_id,
            user_level: user.user_level,
            sitebuilder: user.sitebuilder === 1,
        },
    };
}
async function signup(data) {
    // Collect all duplicate field errors at once
    const errors = [];
    const existingUser = await User_1.User.getByUsername(data.username);
    if (existingUser) {
        errors.push('Username already exists');
    }
    const emailExists = await User_1.User.isEmailExist(data.email);
    if (emailExists) {
        errors.push('Email already exists');
    }
    if (data.domain_name) {
        const domainExists = await Domain_1.Domain.getByName(data.domain_name);
        if (domainExists) {
            errors.push('Domain name already taken');
        }
    }
    if (errors.length > 0) {
        throw new errors_1.BadRequestError('Signup validation failed', errors);
    }
    const hashedPassword = await (0, password_1.hashPassword)(data.password);
    let domainId = 0;
    let userLevel = 2;
    let domainName;
    // Create domain if domain_name provided
    if (data.domain_name) {
        const domain = await Domain_1.Domain.query().insert({
            domain_name: data.domain_name,
            company_name: data.full_name || '',
            company_address: '',
            phone_number: data.phone || '',
            email: data.email || '',
            company_desc: '',
            status: Domain_1.Domain.ACTIVE,
        });
        await Setting_1.Setting.query().insert({
            domain_id: domain.domain_id,
            domain_name: data.domain_name,
            logo: '',
            mobile_logo: '',
            page_style: 0,
            theme: 0,
            banner_display: 0,
            footer_align: 0,
        });
        domainId = domain.domain_id;
        userLevel = 1;
        domainName = data.domain_name;
    }
    const user = await User_1.User.query().insert({
        username: data.username,
        password: hashedPassword,
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        verify_code: null,
        sitebuilder: 0,
        user_level: userLevel,
        domain_id: domainId,
    });
    return { userid: user.userid, domain_name: domainName };
}
async function verifyAccount(username, code) {
    const user = await User_1.User.getByUsername(username);
    if (!user) {
        throw new errors_1.BadRequestError('User not found');
    }
    if (user.verify_code !== code) {
        throw new errors_1.BadRequestError('Invalid verification code');
    }
    await User_1.User.query().patch({ verify_code: null }).where('userid', user.userid);
}
async function refreshAccessToken(refreshToken) {
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, index_1.config.jwt.secret);
        if (decoded.type !== 'refresh') {
            throw new errors_1.UnauthorizedError('Invalid token type');
        }
        // Check if refresh token is still valid in Redis
        const redisKey = `refresh:${decoded.sub}:${refreshToken.slice(-20)}`;
        const exists = await redis_1.redis.get(redisKey);
        if (!exists) {
            // Token reuse detected — revoke all tokens for this user
            const keys = await redis_1.redis.keys(`refresh:${decoded.sub}:*`);
            if (keys.length)
                await redis_1.redis.del(...keys);
            throw new errors_1.UnauthorizedError('Token revoked');
        }
        // Delete old refresh token
        await redis_1.redis.del(redisKey);
        const user = await User_1.User.query().findById(decoded.sub);
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user.userid);
        // Store new refresh token
        await redis_1.redis.setex(`refresh:${user.userid}:${newRefreshToken.slice(-20)}`, 7 * 24 * 3600, 'valid');
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    catch (err) {
        if (err instanceof errors_1.UnauthorizedError || err instanceof errors_1.ForbiddenError)
            throw err;
        throw new errors_1.UnauthorizedError('Invalid refresh token');
    }
}
async function logout(userId, refreshToken) {
    const redisKey = `refresh:${userId}:${refreshToken.slice(-20)}`;
    await redis_1.redis.del(redisKey);
}
// Need to import Domain for status check
const Domain_1 = require("../models/Domain");
const Setting_1 = require("../models/Setting");
//# sourceMappingURL=auth.service.js.map