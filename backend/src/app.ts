import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';

import AppError from './utils/AppError';
import { globalErrorHandler } from './middlewares/errorHandler';
import authRouter from './routes/authRoutes';

const app: Application = express();

// 1. GLOBAL MIDDLEWARES

// Secure HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Request logger
app.use(pinoHttp({
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined
}));

// Limit requests from same API
const limiter = rateLimit({
  max: 200,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 2. ROUTES
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'TrustSeal API is running.' });
});

app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/agreements', agreementRouter);

// 3. UNHANDLED ROUTES
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
