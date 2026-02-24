import { Test, ITest } from '../models/Test.js';
import { generateNumericId } from '../utils/dbplugins.js';
import type { CreateTestInput, UpdateTestInput, TestStatus } from '../validators/test.validator.js';

/**
 * Create a new test
 */
export const createTest = async (
  orgId: string,
  userId: string,
  data: CreateTestInput
): Promise<ITest> => {
  const testId = generateNumericId('tests');
  
  const test = await Test.create({
    _id: testId,
    orgId,
    title: data.title,
    description: data.description,
    status: data.status || 'draft',
    createdBy: userId,
  });

  return test;
};

/**
 * Get all tests for an organization
 */
export const getTests = async (
  orgId: string,
  filters?: {
    status?: TestStatus;
    createdBy?: string;
    search?: string;
  },
  pagination?: {
    page?: number;
    limit?: number;
  }
): Promise<{ tests: ITest[]; total: number; page: number; totalPages: number }> => {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = { orgId, deletedAt: null };

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.createdBy) {
    query.createdBy = filters.createdBy;
  }

  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [tests, total] = await Promise.all([
    Test.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Test.countDocuments(query),
  ]);

  return {
    tests,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get test by ID
 */
export const getTestById = async (
  testId: string,
  orgId: string
): Promise<ITest | null> => {
  return Test.findOne({
    _id: testId,
    orgId,
    deletedAt: null,
  });
};

/**
 * Update test
 */
export const updateTest = async (
  testId: string,
  orgId: string,
  data: UpdateTestInput
): Promise<ITest | null> => {
  return Test.findOneAndUpdate(
    { _id: testId, orgId, deletedAt: null },
    { $set: data },
    { new: true }
  );
};

/**
 * Delete test (soft delete)
 */
export const deleteTest = async (
  testId: string,
  orgId: string
): Promise<boolean> => {
  const result = await Test.findOneAndUpdate(
    { _id: testId, orgId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true }
  );

  return !!result;
};
