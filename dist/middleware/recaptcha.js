"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRecaptcha = verifyRecaptcha;
const config_1 = require("../config");
const errors_1 = require("../utils/errors");
async function verifyRecaptcha(req, _res, next) {
    const token = req.body.recaptchaToken;
    if (!token) {
        return next(new errors_1.BadRequestError('reCAPTCHA verification required'));
    }
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${config_1.config.recaptcha.secret}&response=${token}`,
        });
        const data = await response.json();
        if (!data.success) {
            return next(new errors_1.BadRequestError('reCAPTCHA verification failed'));
        }
        delete req.body.recaptchaToken;
        next();
    }
    catch (err) {
        next(new errors_1.BadRequestError('reCAPTCHA verification failed'));
    }
}
//# sourceMappingURL=recaptcha.js.map