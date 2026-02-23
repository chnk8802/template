import mongoose, { Schema, Model } from 'mongoose';
import { numericIdPlugin, softDeletePlugin, timestampsPlugin } from '../utils/numericId.js';

export type Role = 'org_admin' | 'manager' | 'technician';

export interface IMembership {
  _id: string;
  userId: string;
  orgId: string;
  role: Role;
  status: 'active' | 'inactive' | 'pending';
  invitedBy?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

type MembershipModel = Model<IMembership>;

const membershipSchema = new Schema<IMembership, MembershipModel>(
  {
    _id: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    orgId: {
      type: String,
      ref: 'Organization',
      required: true,
    },
    role: {
      type: String,
      enum: ['org_admin', 'manager', 'technician'],
      required: true,
      default: 'technician',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    invitedBy: {
      type: String,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
    id: false,
  }
);

// Compound unique index - user can only have one membership per org
membershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });
membershipSchema.index({ orgId: 1 });
membershipSchema.index({ userId: 1 });
membershipSchema.index({ status: 1 });

// Plugins
membershipSchema.plugin(numericIdPlugin);
membershipSchema.plugin(timestampsPlugin);
membershipSchema.plugin(softDeletePlugin);

export const Membership = mongoose.model<IMembership>(
  'Membership',
  membershipSchema
);
