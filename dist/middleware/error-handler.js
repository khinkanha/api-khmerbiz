"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const index_1 = require("../config/index");
const errors_1 = require("../utils/errors");
function errorHandler(err, _req, res, _next) {
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            status: false,
            message: err.message,
            errors: err.details,
        });
    }
    // Prisma/Objection errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
        });
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: false,
            message: 'Invalid token',
        });
    }
    // Unknown error
    console.error('Unhandled error:', err);
    const aiDebug = err.aiDebug;
    return res.status(500).json({
        status: false,
        message: index_1.config.isDev ? err.message : 'Internal server error',
        ...(index_1.config.isDev && { stack: err.stack }),
        ...(aiDebug && { aiDebug }),
    });
}
//# sourceMappingURL=error-handler.js.map