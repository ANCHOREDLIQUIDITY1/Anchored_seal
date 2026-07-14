"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});
// Load env vars
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustseal';
mongoose_1.default
    .connect(DB)
    .then(() => console.log('DB connection successful!'))
    .catch((err) => console.error('DB connection error:', err));
const port = process.env.PORT || 5000;
const server = app_1.default.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
