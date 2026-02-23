import { Request, Response, NextFunction } from 'express';
import * as orgService from '../services/org.service.js';
import { sendSuccess, errorResponses } from '../utils/response.js';
import {
  createOrgSchema,
  updateOrgSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  acceptInvitationSchema,
} from '../validators/org.validator.js';

/**
 * Create a new organization
 */
export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = createOrgSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const { name, slug, logo } = validationResult.data;
    const userId = req.userId!;

    const result = await orgService.createOrganization(name, userId, slug, logo);

    sendSuccess(
      res,
      {
        org: result.org,
        membership: result.membership,
      },
      'Organization created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all organizations for current user
 */
export const getUserOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const orgs = await orgService.getUserOrganizations(userId);

    sendSuccess(res, orgs);
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization by slug
 */
export const getOrganizationBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgSlug } = req.params;
    const org = await orgService.getOrganizationBySlug(orgSlug);

    if (!org) {
      errorResponses.notFound(res, 'Organization');
      return;
    }

    sendSuccess(res, org);
  } catch (error) {
    next(error);
  }
};

/**
 * Update organization
 */
export const updateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgSlug } = req.params;

    const validationResult = updateOrgSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    // Get org by slug
    const org = await orgService.getOrganizationBySlug(orgSlug);
    if (!org) {
      errorResponses.notFound(res, 'Organization');
      return;
    }

    const updatedOrg = await orgService.updateOrganization(
      org._id,
      validationResult.data as Partial<Pick<import('../models/Organization.js').IOrganization, 'name' | 'logo' | 'status' | 'settings'>>
    );

    sendSuccess(res, updatedOrg, 'Organization updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization members
 */
export const getOrganizationMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgSlug } = req.params;

    const org = await orgService.getOrganizationBySlug(orgSlug);
    if (!org) {
      errorResponses.notFound(res, 'Organization');
      return;
    }

    const members = await orgService.getOrganizationMembers(org._id);

    sendSuccess(res, members);
  } catch (error) {
    next(error);
  }
};

/**
 * Invite a member to organization
 */
export const inviteMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgSlug } = req.params;

    const validationResult = inviteMemberSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const org = await orgService.getOrganizationBySlug(orgSlug);
    if (!org) {
      errorResponses.notFound(res, 'Organization');
      return;
    }

    const { email, role } = validationResult.data;
    const invitation = await orgService.inviteMember(
      email,
      org._id,
      role,
      req.userId!
    );

    sendSuccess(
      res,
      {
        invitation,
        inviteLink: `${process.env.CLIENT_URL}/accept-invitation?token=${invitation.token}`,
      },
      'Invitation sent successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization invitations
 */
export const getOrganizationInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgSlug } = req.params;

    const org = await orgService.getOrganizationBySlug(orgSlug);
    if (!org) {
      errorResponses.notFound(res, 'Organization');
      return;
    }

    const invitations = await orgService.getOrganizationInvitations(org._id);

    sendSuccess(res, invitations);
  } catch (error) {
    next(error);
  }
};

/**
 * Accept an invitation
 */
export const acceptInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = acceptInvitationSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const { token } = validationResult.data;
    const userId = req.userId!;

    const result = await orgService.acceptInvitation(token, userId);

    sendSuccess(
      res,
      {
        membership: result.membership,
        org: result.org,
      },
      'Invitation accepted successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgSlug, memberId } = req.params;

    const validationResult = updateMemberRoleSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const org = await orgService.getOrganizationBySlug(orgSlug);
    if (!org) {
      errorResponses.notFound(res, 'Organization');
      return;
    }

    const membership = await orgService.updateMemberRole(
      memberId,
      org._id,
      validationResult.data.role
    );

    if (!membership) {
      errorResponses.notFound(res, 'Member');
      return;
    }

    sendSuccess(res, membership, 'Member role updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove member from organization
 */
export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgSlug, memberId } = req.params;

    const org = await orgService.getOrganizationBySlug(orgSlug);
    if (!org) {
      errorResponses.notFound(res, 'Organization');
      return;
    }

    const success = await orgService.removeMember(memberId, org._id);

    if (!success) {
      errorResponses.notFound(res, 'Member');
      return;
    }

    sendSuccess(res, null, 'Member removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel invitation
 */
export const cancelInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgSlug, invitationId } = req.params;

    const org = await orgService.getOrganizationBySlug(orgSlug);
    if (!org) {
      errorResponses.notFound(res, 'Organization');
      return;
    }

    const success = await orgService.cancelInvitation(invitationId, org._id);

    if (!success) {
      errorResponses.notFound(res, 'Invitation');
      return;
    }

    sendSuccess(res, null, 'Invitation cancelled successfully');
  } catch (error) {
    next(error);
  }
};
