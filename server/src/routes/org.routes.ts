import { Router } from 'express';
import * as orgController from '../controllers/org.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  loadOrgContext,
  requireOrgAdmin,
  requireManager,
  canManageMember,
  preventLastAdminModification,
} from '../middleware/rbac.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/orgs
 * @desc    Create a new organization
 * @access  Private (any authenticated user)
 */
router.post('/', orgController.createOrganization);

/**
 * @route   GET /api/orgs
 * @desc    Get all organizations for current user
 * @access  Private
 */
router.get('/', orgController.getUserOrganizations);

/**
 * @route   POST /api/orgs/accept-invitation
 * @desc    Accept an invitation to join an organization
 * @access  Private
 */
router.post('/accept-invitation', orgController.acceptInvitation);

/**
 * @route   GET /api/orgs/:orgSlug
 * @desc    Get organization by slug
 * @access  Private (requires org membership)
 */
router.get('/:orgSlug', loadOrgContext, orgController.getOrganizationBySlug);

/**
 * @route   PUT /api/orgs/:orgSlug
 * @desc    Update organization
 * @access  Private (requires org_admin)
 */
router.put(
  '/:orgSlug',
  loadOrgContext,
  requireOrgAdmin,
  orgController.updateOrganization
);

/**
 * @route   GET /api/orgs/:orgSlug/members
 * @desc    Get all members of an organization
 * @access  Private (requires org membership)
 */
router.get(
  '/:orgSlug/members',
  loadOrgContext,
  orgController.getOrganizationMembers
);

/**
 * @route   POST /api/orgs/:orgSlug/invitations
 * @desc    Invite a member to organization
 * @access  Private (requires manager+)
 */
router.post(
  '/:orgSlug/invitations',
  loadOrgContext,
  requireManager,
  orgController.inviteMember
);

/**
 * @route   GET /api/orgs/:orgSlug/invitations
 * @desc    Get all pending invitations for organization
 * @access  Private (requires manager+)
 */
router.get(
  '/:orgSlug/invitations',
  loadOrgContext,
  requireManager,
  orgController.getOrganizationInvitations
);

/**
 * @route   PUT /api/orgs/:orgSlug/members/:memberId/role
 * @desc    Update member role
 * @access  Private (requires org_admin for admin roles, manager for technicians)
 */
router.put(
  '/:orgSlug/members/:memberId/role',
  loadOrgContext,
  canManageMember,
  preventLastAdminModification,
  orgController.updateMemberRole
);

/**
 * @route   DELETE /api/orgs/:orgSlug/members/:memberId
 * @desc    Remove member from organization
 * @access  Private (requires org_admin for admin roles, manager for technicians)
 */
router.delete(
  '/:orgSlug/members/:memberId',
  loadOrgContext,
  canManageMember,
  preventLastAdminModification,
  orgController.removeMember
);

/**
 * @route   DELETE /api/orgs/:orgSlug/invitations/:invitationId
 * @desc    Cancel pending invitation
 * @access  Private (requires manager+)
 */
router.delete(
  '/:orgSlug/invitations/:invitationId',
  loadOrgContext,
  requireManager,
  orgController.cancelInvitation
);

export default router;
