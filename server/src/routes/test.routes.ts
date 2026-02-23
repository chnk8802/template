import { Router } from 'express';
import * as testController from '../controllers/test.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loadOrgContext, requireMember, requireManager } from '../middleware/rbac.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/:orgSlug/tests
 * @desc    Create a new test
 * @access  Private (requires org membership, manager+ can create)
 */
router.post(
  '/:orgSlug/tests',
  loadOrgContext,
  requireManager,
  testController.createTest
);

/**
 * @route   GET /api/:orgSlug/tests
 * @desc    Get all tests for organization
 * @access  Private (requires org membership)
 */
router.get(
  '/:orgSlug/tests',
  loadOrgContext,
  requireMember,
  testController.getTests
);

/**
 * @route   GET /api/:orgSlug/tests/:testId
 * @desc    Get test by ID
 * @access  Private (requires org membership)
 */
router.get(
  '/:orgSlug/tests/:testId',
  loadOrgContext,
  requireMember,
  testController.getTestById
);

/**
 * @route   PUT /api/:orgSlug/tests/:testId
 * @desc    Update test
 * @access  Private (requires org membership, manager+ can update)
 */
router.put(
  '/:orgSlug/tests/:testId',
  loadOrgContext,
  requireManager,
  testController.updateTest
);

/**
 * @route   DELETE /api/:orgSlug/tests/:testId
 * @desc    Delete test
 * @access  Private (requires org membership, manager+ can delete)
 */
router.delete(
  '/:orgSlug/tests/:testId',
  loadOrgContext,
  requireManager,
  testController.deleteTest
);

export default router;
