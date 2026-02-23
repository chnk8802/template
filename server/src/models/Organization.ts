import mongoose, { Schema, Model } from 'mongoose';
import { numericIdPlugin, softDeletePlugin, timestampsPlugin } from '../utils/numericId.js';

export interface IOrganization {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: {
    allowMemberInvites: boolean;
    defaultRole: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

type OrgModel = Model<IOrganization>;

const organizationSchema = new Schema<IOrganization, OrgModel>(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      // unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
      minlength: 3,
      maxlength: 50,
    },
    logo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    settings: {
      allowMemberInvites: {
        type: Boolean,
        default: true,
      },
      defaultRole: {
        type: String,
        default: 'technician',
      },
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
    _id: false,
    id: false,
  }
);

// Indexes
organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ createdBy: 1 });
organizationSchema.index({ status: 1 });

// Plugins
organizationSchema.plugin(numericIdPlugin);
organizationSchema.plugin(timestampsPlugin);
organizationSchema.plugin(softDeletePlugin);

export const Organization = mongoose.model<IOrganization>(
  'Organization',
  organizationSchema
);
