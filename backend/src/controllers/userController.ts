import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import AppError from '../utils/AppError';

// GET /api/v1/users/me
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/users/me
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone } = req.body;

    // Only allow updating safe fields
    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user?._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) return next(new AppError('User not found', 404));

    // Also update the stored user data for the frontend
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/users/me/password
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide both current and new passwords', 400));
    }

    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters', 400));
    }

    // Get user with password field selected
    const user = await User.findById(req.user?._id).select('+password');
    if (!user) return next(new AppError('User not found', 404));

    // Verify current password
    const isCorrect = await user.comparePassword(currentPassword);
    if (!isCorrect) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password (triggers pre-save hook for hashing)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/users/me/notifications
export const updateNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notifications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { 'preferences.notifications': notifications },
      { new: true, runValidators: true }
    );

    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      data: user.preferences.notifications,
    });
  } catch (err) {
    next(err);
  }
};
