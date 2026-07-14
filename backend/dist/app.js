"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pino_http_1 = __importDefault(require("pino-http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const AppError_1 = __importDefault(require("./utils/AppError"));
const errorHandler_1 = require("./middlewares/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const agreementRoutes_1 = __importDefault(require("./routes/agreementRoutes"));
const app = (0, express_1.default)();
// 1. GLOBAL MIDDLEWARES
// Secure HTTP headers
app.use((0, helmet_1.default)());
// Enable CORS
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
// Request logger
app.use((0, pino_http_1.default)({
    transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined
}));
// Limit requests from same API
const limiter = (0, express_rate_limit_1.default)({
    max: 200,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);
// Body parser, reading data from body into req.body
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
app.use((0, cookie_parser_1.default)());
// Data sanitization against NoSQL query injection
app.use((0, express_mongo_sanitize_1.default)());
// 2. ROUTES
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'TrustSeal API is running.' });
});
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/agreements', agreementRoutes_1.default);
// 3. UNHANDLED ROUTES
app.all('*', (req, res, next) => {
    next(new AppError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
// 4. GLOBAL ERROR HANDLER
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
