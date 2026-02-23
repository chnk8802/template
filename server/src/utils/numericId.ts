import { customAlphabet } from 'nanoid';
import { Schema } from 'mongoose';

// Generate numeric-only IDs (24 digits for uniqueness)
const nanoid = customAlphabet('0123456789', 24);

/**
 * Generate a 24-digit numeric ID
 * @param _collection - Optional collection name (for future use with counter-based IDs)
 */
export const generateNumericId = (_collection?: string): string => nanoid();

/**
 * Mongoose plugin to auto-generate numeric ID for new documents
 */
export const numericIdPlugin = (schema: Schema): void => {
  schema.add({
    id: {
      type: String,
      default: () => generateNumericId(),
      unique: true,
      index: true,
    },
  });

  // Remove _id and __v from JSON output
  schema.set('toJSON', {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret._id;
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret.__v;
      return ret;
    },
  });

  // Remove _id and __v from Object output
  schema.set('toObject', {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret._id;
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret.__v;
      return ret;
    },
  });
};

/**
 * Soft delete plugin
 */
export const softDeletePlugin = (schema: Schema): void => {
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  // Add soft delete method
  schema.methods.softDelete = function () {
    this.deletedAt = new Date();
    return this.save();
  };

  // Add restore method
  schema.methods.restore = function () {
    this.deletedAt = null;
    return this.save();
  };

  // Add isDeleted virtual
  schema.virtual('isDeleted').get(function () {
    return this.deletedAt !== null;
  });

  // Query helper to exclude deleted documents by default
  schema.pre(/^find/, function (this: any) {
    if (this.getOptions().withDeleted !== true) {
      this.where({ deletedAt: null });
    }
  });
};

/**
 * Timestamps plugin (createdAt, updatedAt)
 */
export const timestampsPlugin = (schema: Schema): void => {
  schema.add({
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });
};
