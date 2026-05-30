"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const objection_1 = require("objection");
const knex_1 = __importDefault(require("knex"));
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
const error_handler_1 = require("./middleware/error-handler");
const domain_scope_1 = require("./middleware/domain-scope");
const index_1 = require("./config/index");
function createApp() {
    const app = (0, express_1.default)();
    // Trust nginx reverse proxy
    app.set('trust proxy', 1);
    // Initialize Knex + Objection
    const knex = (0, knex_1.default)(database_1.knexConfig);
    objection_1.Model.knex(knex);
    // Security headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: index_1.config.isDev ? false : undefined,
        crossOriginEmbedderPolicy: false,
    }));
    // Compression
    app.use((0, compression_1.default)());
    // CORS
    app.use((0, cors_1.default)({
        origin: true, // Allow all in development; restrict in production
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Forwarded-Host'],
        credentials: true,
        maxAge: 86400,
    }));
    // Body parsing
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(express_1.default.urlencoded({ limit: '1mb', extended: true }));
    // Domain resolution middleware
    app.use(domain_scope_1.domainScope);
    // API routes
    app.use('/api/v1', routes_1.default);
    // 404 handler
    app.use('/api', (_req, res) => {
        res.status(404).json({ status: false, message: 'Endpoint not found' });
    });
    // Global error handler (must be last)
    app.use(error_handler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map