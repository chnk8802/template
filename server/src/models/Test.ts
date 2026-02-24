import mongoose, { Schema, Model } from 'mongoose';
import { numericIdPlugin, softDeletePlugin, timestampsPlugin } from '../utils/dbplugins.js';

export interface ITest {
  _id: string;
  id: string;
  orgId: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

type TestModel = Model<ITest>;

const testSchema = new Schema<ITest, TestModel>(
  {
    orgId: {
      type: String,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft',
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    id: false,
  }
);

// Compound indexes for multi-tenancy
testSchema.index({ orgId: 1, status: 1 });
testSchema.index({ orgId: 1, createdBy: 1 });
testSchema.index({ orgId: 1, createdAt: -1 });

// Plugins
testSchema.plugin(numericIdPlugin);
testSchema.plugin(timestampsPlugin);
testSchema.plugin(softDeletePlugin);

export const Test = mongoose.model<ITest>('Test', testSchema);
