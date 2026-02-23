export type TestStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Test {
  id: string;
  orgId: string;
  title: string;
  description?: string;
  status: TestStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestInput {
  title: string;
  description?: string;
  status?: TestStatus;
}

export interface UpdateTestInput {
  title?: string;
  description?: string;
  status?: TestStatus;
}

export interface TestsResponse {
  tests: Test[];
  total: number;
  page: number;
  totalPages: number;
}
