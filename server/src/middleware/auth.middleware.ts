import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponses } from '../utils/response.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      orgId?: string;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user ID to request
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponses.unauthorized(res, 'No access token provided');
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const payload = verifyAccessToken(token);
    
    // Attach user info to request
    req.userId = payload.userId;
    req.orgId = payload.orgId;

    next();
  } catch (error) {
    errorResponses.unauthorized(res, 'Invalid or expired access token');
    return;
  }
};

/**
 * Optional authentication middleware
 * Attaches user ID if token is valid, but doesn't require it
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      req.userId = payload.userId;
      req.orgId = payload.orgId;
    }
    
    next();
  } catch {
    // Silently continue without user info
    next();
  }
};
