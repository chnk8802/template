import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { sendSuccess, errorResponses } from '../utils/response.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

/**
 * Register a new user
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const { email, password, firstName, lastName } = validationResult.data;

    // Register user
    const result = await authService.registerUser(
      email,
      password,
      firstName,
      lastName
    );

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const { email, password } = validationResult.data;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    // Login user
    const result = await authService.loginUser(
      email,
      password,
      userAgent,
      ipAddress
    );

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshTokenValue = req.cookies?.refreshToken;

    if (!refreshTokenValue) {
      errorResponses.unauthorized(res, 'Refresh token not found');
      return;
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const tokens = await authService.refreshAccessToken(
      refreshTokenValue,
      userAgent,
      ipAddress
    );

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, {
      accessToken: tokens.accessToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // User ID is set by auth middleware
    const userId = (req as any).userId;

    if (!userId) {
      errorResponses.unauthorized(res, 'Not authenticated');
      return;
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      errorResponses.notFound(res, 'User');
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};
