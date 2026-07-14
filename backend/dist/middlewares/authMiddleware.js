"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const AppError_1 = __importDefault(require("../utils/AppError"));
const protect = async (req, res, next) => {
    try {
        // 1) Getting token and check if it's there
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new AppError_1.default('You are not logged in! Please log in to get access.', 401));
        }
        // 2) Verification token
        const accessSecret = process.env.JWT_SECRET || 'dev_access_secret_do_not_use_in_prod';
        const decoded = jsonwebtoken_1.default.verify(token, accessSecret);
        // 3) Check if user still exists
        const currentUser = await User_1.User.findById(decoded.id);
        if (!currentUser) {
            return next(new AppError_1.default('The user belonging to this token no longer exists.', 401));
        }
        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    }
    catch (err) {
        next(new AppError_1.default('Invalid or expired token. Please log in again.', 401));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError_1.default('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
