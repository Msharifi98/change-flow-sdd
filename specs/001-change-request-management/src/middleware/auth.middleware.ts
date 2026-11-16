import { NextFunction, Request, Response } from 'express';
import { AppError, ERRORS } from '../errors/AppError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: 'REQUESTER' | 'REVIEWER';
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: ERRORS.UNAUTHORIZED,
      statusCode: 401,
    });
  }

  // In a real implementation, this would look up the user in the database
  // For this mock implementation, we attach the user ID to the request
  req.user = {
    id: userId,
    username: user-,
    role: 'REQUESTER', // Default role - would be looked up from DB
  };

  next();
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: ERRORS.UNAUTHORIZED,
        statusCode: 401,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: ERRORS.FORBIDDEN,
        statusCode: 403,
      });
    }

    next();
  };
};
