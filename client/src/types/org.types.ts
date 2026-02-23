export type Role = 'org_admin' | 'manager' | 'technician';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: {
    allowMemberInvites: boolean;
    defaultRole: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  orgId: string;
  role: Role;
  status: 'active' | 'inactive' | 'pending';
  invitedBy?: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  orgId: string;
  role: Role;
  token: string;
  invitedBy: string;
  expiresAt: string;
  acceptedAt?: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrgMember {
  membership: Membership;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
  };
}

export interface UserOrg {
  org: Organization;
  membership: Membership;
}

export interface CreateOrgInput {
  name: string;
  slug?: string;
  logo?: string;
}

export interface UpdateOrgInput {
  name?: string;
  logo?: string;
  status?: 'active' | 'inactive' | 'suspended';
  settings?: {
    allowMemberInvites?: boolean;
    defaultRole?: string;
  };
}

export interface InviteMemberInput {
  email: string;
  role?: Role;
}

export interface AcceptInvitationInput {
  token: string;
}
