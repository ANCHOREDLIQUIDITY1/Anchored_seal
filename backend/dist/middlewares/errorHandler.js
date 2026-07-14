"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // Log error for debugging
    console.error('ERROR', err);
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    else {
        // Programming or other unknown error: don't leak error details
        res.status(500).json({
            success: false,
            message: 'Something went very wrong!',
        });
    }
};
exports.globalErrorHandler = globalErrorHandler;
