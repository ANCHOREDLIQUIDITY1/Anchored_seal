"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const AppError_1 = __importDefault(require("../utils/AppError"));
const signToken = (id, secret, expiresIn) => {
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: expiresIn });
};
const createSendTokens = (user, statusCode, req, res) => {
    const accessSecret = process.env.JWT_SECRET || 'dev_access_secret_do_not_use_in_prod';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_do_not_use_in_prod';
    const accessToken = signToken(user._id.toString(), accessSecret, process.env.JWT_EXPIRES_IN || '7d');
    const refreshToken = signToken(user._id.toString(), refreshSecret, '30d');
    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict',
    });
    // Remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        success: true,
        token: accessToken,
        data: {
            user,
        },
    });
};
const register = async (req, res, next) => {
    try {
        const newUser = await User_1.User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        createSendTokens(newUser, 201, req, res);
    }
    catch (err) {
        if (err.code === 11000) {
            return next(new AppError_1.default('Email already exists. Please login.', 400));
        }
        next(err);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // 1) Check if email and password exist
        if (!email || !password) {
            return next(new AppError_1.default('Please provide email and password!', 400));
        }
        // 2) Check if user exists && password is correct
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError_1.default('Incorrect email or password', 401));
        }
        // 3) If everything ok, send token to client
        createSendTokens(user, 200, req, res);
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        // Get refresh token from cookie
        const token = req.cookies?.refreshToken;
        if (!token) {
            return next(new AppError_1.default('You are not logged in! Please log in to get access.', 401));
        }
        // Verify token
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_do_not_use_in_prod';
        const decoded = jsonwebtoken_1.default.verify(token, refreshSecret);
        // Check if user still exists
        const currentUser = await User_1.User.findById(decoded.id);
        if (!currentUser) {
            return next(new AppError_1.default('The user belonging to this token no longer exists.', 401));
        }
        // Issue new tokens (Token rotation)
        createSendTokens(currentUser, 200, req, res);
    }
    catch (err) {
        next(new AppError_1.default('Invalid refresh token. Please log in again.', 401));
    }
};
exports.refreshToken = refreshToken;
const logout = (req, res) => {
    res.cookie('refreshToken', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true });
};
exports.logout = logout;
