"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotifications = exports.updatePassword = exports.updateProfile = exports.getMe = void 0;
const User_1 = require("../models/User");
const AppError_1 = __importDefault(require("../utils/AppError"));
// GET /api/v1/users/me
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user?._id);
        if (!user)
            return next(new AppError_1.default('User not found', 404));
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
// PATCH /api/v1/users/me
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        // Only allow updating safe fields
        const updates = {};
        if (name)
            updates.name = name;
        if (phone !== undefined)
            updates.phone = phone;
        const user = await User_1.User.findByIdAndUpdate(req.user?._id, updates, {
            new: true,
            runValidators: true,
        });
        if (!user)
            return next(new AppError_1.default('User not found', 404));
        // Also update the stored user data for the frontend
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateProfile = updateProfile;
// PATCH /api/v1/users/me/password
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return next(new AppError_1.default('Please provide both current and new passwords', 400));
        }
        if (newPassword.length < 8) {
            return next(new AppError_1.default('New password must be at least 8 characters', 400));
        }
        // Get user with password field selected
        const user = await User_1.User.findById(req.user?._id).select('+password');
        if (!user)
            return next(new AppError_1.default('User not found', 404));
        // Verify current password
        const isCorrect = await user.comparePassword(currentPassword);
        if (!isCorrect) {
            return next(new AppError_1.default('Current password is incorrect', 401));
        }
        // Update password (triggers pre-save hook for hashing)
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updatePassword = updatePassword;
// PATCH /api/v1/users/me/notifications
const updateNotifications = async (req, res, next) => {
    try {
        const { notifications } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.user?._id, { 'preferences.notifications': notifications }, { new: true, runValidators: true });
        if (!user)
            return next(new AppError_1.default('User not found', 404));
        res.status(200).json({
            success: true,
            message: 'Notification preferences updated',
            data: user.preferences.notifications,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateNotifications = updateNotifications;
