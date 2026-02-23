import { z } from 'zod';

// Role enum
export const roleEnum = z.enum(['org_admin', 'manager', 'technician']);

// Create organization schema
export const createOrgSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be at most 100 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  logo: z.string().url().optional(),
});

// Update organization schema
export const updateOrgSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be at most 100 characters')
    .optional(),
  logo: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  settings: z
    .object({
      allowMemberInvites: z.boolean().optional(),
      defaultRole: z.string().optional(),
    })
    .optional(),
});

// Invite member schema
export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: roleEnum.default('technician'),
});

// Update member role schema
export const updateMemberRoleSchema = z.object({
  role: roleEnum,
});

// Accept invitation schema
export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
});

// Organization slug param schema
export const orgSlugParamSchema = z.object({
  orgSlug: z
    .string()
    .min(3, 'Invalid organization slug')
    .max(50, 'Invalid organization slug'),
});

// Member ID param schema
export const memberIdParamSchema = z.object({
  memberId: z.string().min(1, 'Invalid member ID'),
});

// Types
export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type Role = z.infer<typeof roleEnum>;
