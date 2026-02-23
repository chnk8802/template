import mongoose, { Schema, Model } from 'mongoose';
import { numericIdPlugin, softDeletePlugin, timestampsPlugin } from '../utils/numericId.js';
import type { Role } from './Membership.js';

export interface IInvitation {
  _id: string;
  email: string;
  orgId: string;
  role: Role;
  token: string;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

type InvitationModel = Model<IInvitation>;

const invitationSchema = new Schema<IInvitation, InvitationModel>(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
    token: {
      type: String,
      required: true,
      // unique: true,
    },
    invitedBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    acceptedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'cancelled'],
      default: 'pending',
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

// Indexes
invitationSchema.index({ token: 1 }, /*{ unique: true }*/);
invitationSchema.index({ orgId: 1, email: 1 });
invitationSchema.index({ email: 1, status: 1 });
// invitationSchema.index({ expiresAt: 1 });

// Plugins
invitationSchema.plugin(numericIdPlugin);
invitationSchema.plugin(timestampsPlugin);
invitationSchema.plugin(softDeletePlugin);

export const Invitation = mongoose.model<IInvitation>(
  'Invitation',
  invitationSchema
);
