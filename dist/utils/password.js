"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.rehashPassword = rehashPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const MD5_REGEX = /^[a-f0-9]{32}$/i;
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 12);
}
async function comparePassword(password, hash) {
    // If stored hash is MD5, compare with MD5 then flag for rehash
    if (MD5_REGEX.test(hash)) {
        const md5Hash = crypto_1.default.createHash('md5').update(password).digest('hex');
        if (md5Hash === hash) {
            return { match: true, needsRehash: true };
        }
        return { match: false, needsRehash: false };
    }
    // Otherwise compare with bcrypt
    const match = await bcryptjs_1.default.compare(password, hash);
    return { match, needsRehash: false };
}
async function rehashPassword(password) {
    return hashPassword(password);
}
//# sourceMappingURL=password.js.map