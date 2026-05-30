"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
function validate(schema) {
    return (req, _res, next) => {
        try {
            const result = schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            });
            req.body = result.body ?? req.body;
            req.params = result.params ?? req.params;
            req.query = result.query ?? req.query;
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
                return next(new errors_1.BadRequestError('Validation failed', errors));
            }
            next(err);
        }
    };
}
//# sourceMappingURL=validate.js.map