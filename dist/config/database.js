"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knexConfig = void 0;
const index_1 = require("./index");
exports.knexConfig = {
    client: 'mysql2',
    connection: {
        host: index_1.config.db.host,
        port: index_1.config.db.port,
        database: index_1.config.db.database,
        user: index_1.config.db.user,
        password: index_1.config.db.password,
        charset: 'utf8mb4',
    },
    pool: {
        min: 2,
        max: 10,
    },
    acquireConnectionTimeout: 30000,
};
//# sourceMappingURL=database.js.map