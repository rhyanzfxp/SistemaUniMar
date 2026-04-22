import { Response } from 'express';

export const ResponseView = {
  success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },

  error(res: Response, message: string, statusCode = 400, details?: unknown) {
    return res.status(statusCode).json({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  notFound(res: Response, resource = 'Resource') {
    return res.status(404).json({
      success: false,
      message: `${resource} not found`,
      timestamp: new Date().toISOString(),
    });
  },
};
