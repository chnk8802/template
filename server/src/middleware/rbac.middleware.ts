import { Request, Response, NextFunction } from 'express';
import { getMembership, getOrganizationBySlug } from '../services/org.service.js';
import { errorResponses } from '../utils/response.js';
import type { Role } from '../validators/org.validator.js';

// Role hierarchy for permission checks
const roleHierarchy: Record<Role, number> = {
  org_admin: 3,
  manager: 2,
  technician: 1,
};

/**
 * Check if user has required role or higher
 */
const hasRequiredRole = (userRole: Role, requiredRole: Role): boolean => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Middleware to load organization context from URL slug
 * Attaches org and membership to request
 */
export const loadOrgContext = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgSlug } = req.params;

    if (!orgSlug) {
      errorResponses.badRequest(res, 'Organization slug is required');
      return;
    }

    // Get organization
    const org = await getOrganizationBySlug(orgSlug);
    if (!org) {
      errorResponses.notFound(res, 'Organization');
      return;
    }

    // Check if org is active
    if (org.status !== 'active') {
      errorResponses.forbidden(res, 'Organization is not active');
      return;
    }

    // Get user's membership
    const membership = await getMembership(req.userId!, org._id);

    if (!membership || membership.status !== 'active') {
      errorResponses.forbidden(res, 'You do not have access to this organization');
      return;
    }

    // Attach to request
    (req as any).org = org;
    (req as any).membership = membership;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware factory to require minimum role
 */
export const requireRole = (requiredRole: Role) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const membership = (req as any).membership;

      if (!membership) {
        errorResponses.forbidden(res, 'Organization context not loaded');
        return;
      }

      if (!hasRequiredRole(membership.role, requiredRole)) {
        errorResponses.forbidden(
          res,
          `This action requires ${requiredRole} role or higher`
        );
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require org_admin role
 */
export const requireOrgAdmin = requireRole('org_admin');

/**
 * Require manager role (includes org_admin)
 */
export const requireManager = requireRole('manager');

/**
 * Require technician role (all authenticated members)
 */
export const requireMember = requireRole('technician');

/**
 * Check if user can manage a specific member
 * - Org admins can manage anyone
 * - Managers can manage technicians
 * - Technicians cannot manage anyone
 */
export const canManageMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const membership = (req as any).membership;
    const targetMemberId = req.params.memberId;

    if (!membership) {
      errorResponses.forbidden(res, 'Organization context not loaded');
      return;
    }

    // Get target member's role
    const { Membership } = await import('../models/Membership.js');
    const targetMembership = await Membership.findOne({
      _id: targetMemberId,
      orgId: (req as any).org._id,
      deletedAt: null,
    });

    if (!targetMembership) {
      errorResponses.notFound(res, 'Member');
      return;
    }

    // Org admin can manage anyone
    if (membership.role === 'org_admin') {
      (req as any).targetMembership = targetMembership;
      next();
      return;
    }

    // Manager can only manage technicians
    if (membership.role === 'manager' && targetMembership.role === 'technician') {
      (req as any).targetMembership = targetMembership;
      next();
      return;
    }

    errorResponses.forbidden(res, 'You do not have permission to manage this member');
  } catch (error) {
    next(error);
  }
};

/**
 * Prevent self-demotion/removal for org admins
 * An org admin cannot remove or demote themselves if they're the last admin
 */
export const preventLastAdminModification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const membership = (req as any).membership;
    const targetMembership = (req as any).targetMembership;
    const newRole = req.body?.role;

    // Only applies if modifying self
    if (membership._id !== targetMembership._id) {
      next();
      return;
    }

    // If demoting or removing self, check if last admin
    if (
      (newRole && newRole !== 'org_admin') ||
      req.method === 'DELETE'
    ) {
      const { Membership } = await import('../models/Membership.js');
      const adminCount = await Membership.countDocuments({
        orgId: (req as any).org._id,
        role: 'org_admin',
        status: 'active',
        deletedAt: null,
      });

      if (adminCount <= 1) {
        errorResponses.badRequest(
          res,
          'Cannot remove or demote the last organization admin'
        );
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
