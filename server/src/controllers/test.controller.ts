import { Request, Response, NextFunction } from 'express';
import * as testService from '../services/test.service.js';
import { sendSuccess, errorResponses } from '../utils/response.js';
import {
  createTestSchema,
  updateTestSchema,
} from '../validators/test.validator.js';

/**
 * Create a new test
 */
export const createTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = createTestSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const org = (req as any).org;
    const userId = req.userId!;

    const test = await testService.createTest(org._id, userId, validationResult.data);

    sendSuccess(res, test, 'Test created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tests for organization
 */
export const getTests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const org = (req as any).org;
    const { status, createdBy, search, page, limit } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const result = await testService.getTests(
      org._id,
      {
        status: status as any,
        createdBy: createdBy as string,
        search: search as string,
      },
      {
        page: pageNum,
        limit: limitNum,
      }
    );

    const { sendPaginated } = await import('../utils/response.js');
    sendPaginated(res, result.tests, result.page, limitNum, result.total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get test by ID
 */
export const getTestById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { testId } = req.params;
    const org = (req as any).org;

    const test = await testService.getTestById(testId, org._id);

    if (!test) {
      errorResponses.notFound(res, 'Test');
      return;
    }

    sendSuccess(res, test);
  } catch (error) {
    next(error);
  }
};

/**
 * Update test
 */
export const updateTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { testId } = req.params;
    const org = (req as any).org;

    const validationResult = updateTestSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      errorResponses.validationError(res, errors as Record<string, unknown>);
      return;
    }

    const test = await testService.updateTest(testId, org._id, validationResult.data);

    if (!test) {
      errorResponses.notFound(res, 'Test');
      return;
    }

    sendSuccess(res, test, 'Test updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete test
 */
export const deleteTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { testId } = req.params;
    const org = (req as any).org;

    const success = await testService.deleteTest(testId, org._id);

    if (!success) {
      errorResponses.notFound(res, 'Test');
      return;
    }

    sendSuccess(res, null, 'Test deleted successfully');
  } catch (error) {
    next(error);
  }
};
