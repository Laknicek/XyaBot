"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const api_1 = __importDefault(require("./api"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use('/api', api_1.default);
// Serve Frontend (Dashboard)
// We assume the frontend is built to /dist/dashboard
const dashboardPath = path_1.default.join(__dirname, '../../dist/dashboard');
app.use(express_1.default.static(dashboardPath));
app.get(/^(.*)$/, (req, res) => {
    res.sendFile(path_1.default.join(dashboardPath, 'index.html'));
});
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Dashboard running on http://localhost:${PORT}`);
    });
};
exports.startServer = startServer;
