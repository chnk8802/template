import crypto from 'crypto';
import { User, IUser, UserStatus } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import config from '../config/index.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform user document to response object
 */
export const toUserResponse = (user: IUser): UserResponse => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`,
  avatar: user.avatar,
  status: user.status,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * Register a new user
 */
export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    status: UserStatus.ACTIVE,
  });

  // Generate tokens
  const tokens = await createAuthTokens(user);
  console.log("User: ", user, "USER: ", toUserResponse(user))
  return {
    user: toUserResponse(user),
    tokens,
  };
};

/**
 * Login user
 */
export const loginUser = async (
  email: string,
  password: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (user.status !== UserStatus.ACTIVE) {
    throw new Error('Account is not active');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate tokens
  const tokens = await createAuthTokens(user, userAgent, ipAddress);

  return {
    user: toUserResponse(user),
    tokens,
  };
};

/**
 * Create auth tokens for a user
 */
export const createAuthTokens = async (
  user: IUser,
  userAgent?: string,
  ipAddress?: string
): Promise<AuthTokens> => {
  // Generate refresh token
  const tokenId = crypto.randomBytes(32).toString('hex');
  const refreshToken = generateRefreshToken({
    userId: user.id,
    tokenId,
  });

  // Hash and store refresh token
  const hashedToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + parseInt(config.jwt.refreshExpiry) * 7
  );

  await RefreshToken.create({
    token: hashedToken,
    userId: user.id,
    userAgent,
    ipAddress,
    expiresAt,
  });

  // Generate access token
  const accessToken = generateAccessToken({ userId: user.id });

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (
  refreshToken: string,
  userAgent?: string,
  ipAddress?: string
): Promise<AuthTokens> => {
  // Verify refresh token
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error('Invalid refresh token');
  }

  // Hash the token to find in database
  const hashedToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  // Find the token in database
  const storedToken = await RefreshToken.findOne({
    token: hashedToken,
    userId: payload.userId,
  });

  if (!storedToken) {
    throw new Error('Refresh token not found');
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ id: storedToken.id });
    throw new Error('Refresh token has expired');
  }

  // Get user
  const user = await User.findOne({ id: payload.userId });
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new Error('User not found or inactive');
  }

  // Delete old refresh token
  await RefreshToken.deleteOne({ id: storedToken.id });

  // Create new tokens
  return createAuthTokens(user, userAgent, ipAddress);
};

/**
 * Logout user (invalidate refresh token)
 */
export const logoutUser = async (refreshToken: string): Promise<void> => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await RefreshToken.deleteOne({ token: hashedToken });
  } catch {
    // Silently fail - token might not exist
  }
};

/**
 * Logout from all devices
 */
export const logoutAllDevices = async (userId: string): Promise<void> => {
  await RefreshToken.deleteMany({ userId });
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<UserResponse | null> => {
  const user = await User.findOne({ id: userId });
  return user ? toUserResponse(user) : null;
};
