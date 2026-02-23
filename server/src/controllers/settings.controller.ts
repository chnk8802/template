import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import { sendSuccess, errorResponses } from '../utils/response.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { z } from 'zod';

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const updateOrgSettingsSchema = z.object({
  allowMemberInvites: z.boolean().optional(),
  defaultRole: z.enum(['org_admin', 'manager', 'technician']).optional(),
});

/**
 * Get current user profile
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    
    const user = await User.findOne({ _id: userId, deletedAt: null }).select(
      'id email firstName lastName status createdAt updatedAt'
    );

    if (!user) {
      errorResponses.notFound(res, 'User');
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { $set: validationResult.data },
      { new: true }
    ).select('id email firstName lastName status createdAt updatedAt');

    if (!user) {
      errorResponses.notFound(res, 'User');
      return;
    }

    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    const validationResult = changePasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get user with password
    const user = await User.findOne({ _id: userId, deletedAt: null }).select('+passwordHash');

    if (!user) {
      errorResponses.notFound(res, 'User');
      return;
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      errorResponses.badRequest(res, 'Current password is incorrect');
      return;
    }

    // Hash and update new password
    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization settings
 */
export const getOrgSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const org = (req as any).org;

    sendSuccess(res, {
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      status: org.status,
      settings: org.settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update organization settings
 */
export const updateOrgSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const org = (req as any).org;

    const validationResult = updateOrgSettingsSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const updatedOrg = await Organization.findOneAndUpdate(
      { _id: org._id, deletedAt: null },
      { $set: { settings: { ...org.settings, ...validationResult.data } } },
      { new: true }
    );

    sendSuccess(res, updatedOrg?.settings, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's organizations list for settings
 */
export const getUserOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    const memberships = await Membership.find({
      userId,
      status: 'active',
      deletedAt: null,
    });

    const orgIds = memberships.map((m) => m.orgId);
    const orgs = await Organization.find({
      _id: { $in: orgIds },
      deletedAt: null,
    }).select('id name slug status');

    const orgMap = new Map(orgs.map((o) => [o._id, o]));

    const result = memberships
      .filter((m) => orgMap.has(m.orgId))
      .map((m) => ({
        org: orgMap.get(m.orgId),
        role: m.role,
      }));

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
