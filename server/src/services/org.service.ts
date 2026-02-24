import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { Organization, IOrganization } from '../models/Organization.js';
import { Membership, IMembership } from '../models/Membership.js';
import { Invitation, IInvitation } from '../models/Invitation.js';
import { User } from '../models/User.js';
import { generateNumericId } from '../utils/dbplugins.js';
import type { Role } from '../validators/org.validator.js';

/**
 * Generate a unique slug from organization name
 */
const generateUniqueSlug = async (name: string): Promise<string> => {
  // Create base slug from name
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  // Ensure minimum length
  if (baseSlug.length < 3) {
    baseSlug = `org-${baseSlug}`;
  }

  let slug = baseSlug;
  let counter = 1;

  // Check for uniqueness
  while (await Organization.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Generate a unique invitation token
 */
const generateInvitationToken = async (): Promise<string> => {
  let token: string;
  do {
    token = nanoid(32);
  } while (await Invitation.exists({ token }));
  return token;
};

/**
 * Create a new organization with the creator as org_admin
 */
export const createOrganization = async (
  name: string,
  creatorId: string,
  slug?: string,
  logo?: string
): Promise<{ org: IOrganization; membership: IMembership }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Generate or validate slug
    const orgSlug = slug || (await generateUniqueSlug(name));

    // Check if slug is already taken
    if (slug) {
      const existingOrg = await Organization.findOne({ slug }).session(session);
      if (existingOrg) {
        throw new Error('Organization slug is already taken');
      }
    }

    // Create organization
    const orgId = generateNumericId('organizations');
    const [org] = await Organization.create(
      [
        {
          _id: orgId,
          name,
          slug: orgSlug,
          logo,
          createdBy: creatorId,
        },
      ],
      { session }
    );

    // Create membership for creator as org_admin
    const membershipId = generateNumericId('memberships');
    const [membership] = await Membership.create(
      [
        {
          _id: membershipId,
          userId: creatorId,
          orgId: org._id,
          role: 'org_admin',
          status: 'active',
          joinedAt: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { org, membership };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get organization by slug
 */
export const getOrganizationBySlug = async (
  slug: string
): Promise<IOrganization | null> => {
  return Organization.findOne({ slug, deletedAt: null });
};

/**
 * Get organization by ID
 */
export const getOrganizationById = async (
  id: string
): Promise<IOrganization | null> => {
  return Organization.findOne({ _id: id, deletedAt: null });
};

/**
 * Get all organizations for a user
 */
export const getUserOrganizations = async (
  userId: string
): Promise<Array<{ org: IOrganization; membership: IMembership }>> => {
  const memberships = await Membership.find({
    userId,
    status: 'active',
    deletedAt: null,
  });

  const orgIds = memberships.map((m) => m.orgId);
  const orgs = await Organization.find({
    _id: { $in: orgIds },
    deletedAt: null,
  });

  const orgMap = new Map(orgs.map((o) => [o._id, o]));

  return memberships
    .filter((m) => orgMap.has(m.orgId))
    .map((m) => ({
      org: orgMap.get(m.orgId)!,
      membership: m,
    }));
};

/**
 * Update organization
 */
export const updateOrganization = async (
  orgId: string,
  updates: Partial<Pick<IOrganization, 'name' | 'logo' | 'status' | 'settings'>>
): Promise<IOrganization | null> => {
  return Organization.findOneAndUpdate(
    { _id: orgId, deletedAt: null },
    { $set: updates },
    { new: true }
  );
};

/**
 * Get user's membership in an organization
 */
export const getMembership = async (
  userId: string,
  orgId: string
): Promise<IMembership | null> => {
  return Membership.findOne({
    userId,
    orgId,
    deletedAt: null,
  });
};

/**
 * Get all members of an organization
 */
export const getOrganizationMembers = async (
  orgId: string
): Promise<Array<{ membership: IMembership; user: any }>> => {
  const memberships = await Membership.find({
    orgId,
    deletedAt: null,
  }).sort({ createdAt: 1 });

  const userIds = memberships.map((m) => m.userId);
  const users = await User.find({
    _id: { $in: userIds },
    deletedAt: null,
  }).select('id email firstName lastName status');

  const userMap = new Map(users.map((u) => [u.id, u]));

  return memberships
    .filter((m) => userMap.has(m.userId))
    .map((m) => ({
      membership: m,
      user: userMap.get(m.userId),
    }));
};

/**
 * Invite a member to an organization
 */
export const inviteMember = async (
  email: string,
  orgId: string,
  role: Role,
  invitedBy: string
): Promise<IInvitation> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if organization exists
    const org = await Organization.findOne({ _id: orgId, deletedAt: null }).session(session);
    if (!org) {
      throw new Error('Organization not found');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, deletedAt: null }).session(session);

    if (existingUser) {
      // Check if user is already a member
      const existingMembership = await Membership.findOne({
        userId: existingUser._id,
        orgId,
        deletedAt: null,
      }).session(session);

      if (existingMembership) {
        throw new Error('User is already a member of this organization');
      }
    }

    // Check for pending invitation
    const existingInvitation = await Invitation.findOne({
      email,
      orgId,
      status: 'pending',
      deletedAt: null,
    }).session(session);

    if (existingInvitation) {
      throw new Error('An invitation is already pending for this email');
    }

    // Create invitation
    const invitationId = generateNumericId('invitations');
    const token = await generateInvitationToken();

    const [invitation] = await Invitation.create(
      [
        {
          _id: invitationId,
          email,
          orgId,
          role,
          token,
          invitedBy,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return invitation;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get invitation by token
 */
export const getInvitationByToken = async (
  token: string
): Promise<IInvitation | null> => {
  return Invitation.findOne({ token, deletedAt: null });
};

/**
 * Get all invitations for an organization
 */
export const getOrganizationInvitations = async (
  orgId: string
): Promise<IInvitation[]> => {
  return Invitation.find({
    orgId,
    status: 'pending',
    expiresAt: { $gt: new Date() },
    deletedAt: null,
  }).sort({ createdAt: -1 });
};

/**
 * Accept an invitation
 */
export const acceptInvitation = async (
  token: string,
  userId: string
): Promise<{ membership: IMembership; org: IOrganization }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find invitation
    const invitation = await Invitation.findOne({ token, deletedAt: null }).session(session);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation is no longer valid');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Get user
    const user = await User.findOne({ _id: userId, deletedAt: null }).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify email matches
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error('This invitation is for a different email address');
    }

    // Check if already a member
    const existingMembership = await Membership.findOne({
      userId,
      orgId: invitation.orgId,
      deletedAt: null,
    }).session(session);

    if (existingMembership) {
      throw new Error('You are already a member of this organization');
    }

    // Create membership
    const membershipId = generateNumericId('memberships');
    const [membership] = await Membership.create(
      [
        {
          _id: membershipId,
          userId,
          orgId: invitation.orgId,
          role: invitation.role,
          status: 'active',
          invitedBy: invitation.invitedBy,
          joinedAt: new Date(),
        },
      ],
      { session }
    );

    // Update invitation status
    await Invitation.updateOne(
      { _id: invitation._id },
      { status: 'accepted', acceptedAt: new Date() }
    ).session(session);

    // Get organization
    const org = await Organization.findOne({
      _id: invitation.orgId,
      deletedAt: null,
    }).session(session);

    if (!org) {
      throw new Error('Organization not found');
    }

    await session.commitTransaction();
    return { membership, org };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (
  memberId: string,
  orgId: string,
  role: Role
): Promise<IMembership | null> => {
  return Membership.findOneAndUpdate(
    { _id: memberId, orgId, deletedAt: null },
    { $set: { role } },
    { new: true }
  );
};

/**
 * Remove member from organization
 */
export const removeMember = async (
  memberId: string,
  orgId: string
): Promise<boolean> => {
  const result = await Membership.findOneAndUpdate(
    { _id: memberId, orgId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true }
  );
  return !!result;
};

/**
 * Cancel invitation
 */
export const cancelInvitation = async (
  invitationId: string,
  orgId: string
): Promise<boolean> => {
  const result = await Invitation.findOneAndUpdate(
    { _id: invitationId, orgId, status: 'pending', deletedAt: null },
    { $set: { status: 'cancelled' } },
    { new: true }
  );
  return !!result;
};
