"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const index_1 = require("./config/index");
const app = (0, app_1.createApp)();
app.listen(index_1.config.port, () => {
    console.log(`API server running on port ${index_1.config.port} (${index_1.config.nodeEnv})`);
});
exports.default = app;
//# sourceMappingURL=index.js.map