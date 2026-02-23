import { z } from 'zod';

// Status enum
export const testStatusEnum = z.enum(['draft', 'active', 'completed', 'archived']);

// Create test schema
export const createTestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  status: testStatusEnum.default('draft'),
});

// Update test schema
export const updateTestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  status: testStatusEnum.optional(),
});

// Types
export type CreateTestInput = z.infer<typeof createTestSchema>;
export type UpdateTestInput = z.infer<typeof updateTestSchema>;
export type TestStatus = z.infer<typeof testStatusEnum>;
