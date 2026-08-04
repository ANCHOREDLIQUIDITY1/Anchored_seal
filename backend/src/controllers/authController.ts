import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import AppError from '../utils/AppError';

const signToken = (id: string, secret: string, expiresIn: string) => {
  return jwt.sign({ id }, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

const createSendTokens = (user: IUser, statusCode: number, req: Request, res: Response) => {
  const accessSecret = process.env.JWT_SECRET || 'dev_access_secret_do_not_use_in_prod';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_do_not_use_in_prod';
  
  const accessToken = signToken(String(user._id), accessSecret, process.env.JWT_EXPIRES_IN || '7d');
  const refreshToken = signToken(String(user._id), refreshSecret, '30d');

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

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    createSendTokens(newUser, 201, req, res);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return next(new AppError('Email already exists. Please login.', 400));
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendTokens(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get refresh token from cookie
    const token = req.cookies?.refreshToken;
    
    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Verify token
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_do_not_use_in_prod';
    const decoded = jwt.verify(token, refreshSecret) as jwt.JwtPayload;

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Issue new tokens (Token rotation)
    createSendTokens(currentUser, 200, req, res);
  } catch {
    next(new AppError('Invalid refresh token. Please log in again.', 401));
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true });
};
