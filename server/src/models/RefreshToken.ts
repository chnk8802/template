import { Schema, model, Model } from 'mongoose';
import { numericIdPlugin, timestampsPlugin } from '../utils/dbplugins.js';

export interface IRefreshToken {
  _id: string;
  id: string;
  token: string; // hashed token
  userId: string;
  orgId?: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

type RefreshTokenModel = Model<IRefreshToken>;

const refreshTokenSchema = new Schema<IRefreshToken, RefreshTokenModel>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    orgId: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    id: false,
  }
);

// Apply plugins
refreshTokenSchema.plugin(numericIdPlugin);
refreshTokenSchema.plugin(timestampsPlugin);

// Index for cleanup of expired tokens
// refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken, RefreshTokenModel>(
  'RefreshToken',
  refreshTokenSchema
);
