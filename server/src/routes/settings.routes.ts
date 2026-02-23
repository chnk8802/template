import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loadOrgContext, requireOrgAdmin } from '../middleware/rbac.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/settings/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', settingsController.getProfile);

/**
 * @route   PUT /api/settings/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', settingsController.updateProfile);

/**
 * @route   POST /api/settings/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', settingsController.changePassword);

/**
 * @route   GET /api/settings/organizations
 * @desc    Get user's organizations
 * @access  Private
 */
router.get('/organizations', settingsController.getUserOrganizations);

/**
 * @route   GET /api/settings/org/:orgSlug
 * @desc    Get organization settings
 * @access  Private (requires org membership)
 */
router.get(
  '/org/:orgSlug',
  loadOrgContext,
  settingsController.getOrgSettings
);

/**
 * @route   PUT /api/settings/org/:orgSlug
 * @desc    Update organization settings
 * @access  Private (requires org_admin)
 */
router.put(
  '/org/:orgSlug',
  loadOrgContext,
  requireOrgAdmin,
  settingsController.updateOrgSettings
);

export default router;
