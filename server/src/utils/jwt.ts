import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export interface AccessTokenPayload {
  userId: string;
  orgId?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  orgId?: string;
  tokenId: string;
}

/**
 * Generate an access token
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  } as jwt.SignOptions);
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  } as jwt.SignOptions);
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
};

/**
 * Decode a token without verification (for debugging)
 */
export const decodeToken = (token: string): jwt.JwtPayload | null => {
  return jwt.decode(token) as jwt.JwtPayload | null;
};
