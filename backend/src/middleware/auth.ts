import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { CustomError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    technicianId?: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new CustomError('Access token required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      technicianId: decoded.technicianId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new CustomError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new CustomError('Insufficient permissions', 403));
    }

    next();
  };
};

export const requireTechnician = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new CustomError('Authentication required', 401));
  }

  if (req.user.role !== 'technician' && req.user.role !== 'admin') {
    return next(new CustomError('Technician access required', 403));
  }

  if (!req.user.technicianId) {
    return next(new CustomError('Technician profile required', 403));
  }

  next();
};
