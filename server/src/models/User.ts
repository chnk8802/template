import { Schema, model, Model } from 'mongoose';
import { numericIdPlugin, softDeletePlugin, timestampsPlugin } from '../utils/dbplugins.js';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface IUser {
  _id: string;
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IUserMethods {
  softDelete(): Promise<IUser>;
  restore(): Promise<IUser>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(

  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    id: false,
  }
);

// Apply plugins
userSchema.plugin(numericIdPlugin);
userSchema.plugin(softDeletePlugin);
userSchema.plugin(timestampsPlugin);

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const User = model<IUser, UserModel>('User', userSchema);
