import { Request, Response, NextFunction } from 'express';

type CustomError = Error & {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
};

export const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for debugging
  console.error('ERROR', err);

  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({
      success: false,
      message: 'Something went very wrong!',
    });
  }
};
