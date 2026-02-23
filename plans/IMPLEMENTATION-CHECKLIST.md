# MERN Multi-Tenant Starter - Implementation Checklist

> Track your progress by checking off completed items. Each phase builds on the previous one.

---

## Phase 1: Project Setup & Core Infrastructure

### Backend Setup
- [ ] Initialize npm project in `/server` directory
- [ ] Install dependencies: express, mongoose, typescript, @types/*
- [ ] Setup TypeScript configuration (`tsconfig.json`)
- [ ] Create basic Express server (`src/app.ts`)
- [ ] Setup environment variables (`.env` template)
- [ ] Configure MongoDB connection (`src/config/database.ts`)
- [ ] Create numeric ID generator utility (`src/utils/numericId.ts`)
- [ ] Create standard API response utilities (`src/utils/response.ts`)

### Frontend Setup
- [ ] Create Vite React project in `/client` directory
- [ ] Install dependencies: react-router-dom, @tanstack/react-query, zustand, axios
- [ ] Setup Tailwind CSS
- [ ] Initialize shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] Install base shadcn components (Button, Input, Card, Dialog, DropdownMenu, etc.)
- [ ] Setup ESLint + Prettier
- [ ] Create folder structure (components, features, hooks, store, routes)
- [ ] Create Axios instance with base URL (`src/lib/api.ts`)
- [ ] Build shared UI components (DataTable, FormInput, FormSelect)

### Development Tools
- [ ] Setup concurrent scripts for running both servers
- [ ] Create `.env.example` files for both projects
- [ ] Setup git ignore patterns

---

## Phase 2: Authentication System

### Backend - User Model & Utilities
- [ ] Create User model (`src/models/User.ts`)
  - Fields: id, email, passwordHash, firstName, lastName, status, lastLoginAt
  - Apply numericIdPlugin
  - Add soft delete support
- [ ] Create password hashing utility (`src/utils/password.ts`)
- [ ] Create JWT utilities (`src/utils/jwt.ts`)
  - generateAccessToken(userId)
  - generateRefreshToken(userId, orgId)
  - verifyToken(token)

### Backend - Auth Endpoints
- [ ] Create RefreshToken model (`src/models/RefreshToken.ts`)
- [ ] Create auth validator (`src/validators/auth.validator.ts`)
- [ ] Create auth service (`src/services/auth.service.ts`)
- [ ] Create auth controller (`src/controllers/auth.controller.ts`)
  - register
  - login
  - logout
  - refreshToken
  - getCurrentUser
- [ ] Create auth routes (`src/routes/auth.routes.ts`)
- [ ] Create auth middleware (`src/middleware/auth.middleware.ts`)

### Frontend - Auth UI
- [ ] Create auth types (`src/types/auth.types.ts`)
- [ ] Create auth store (`src/store/authStore.ts`)
- [ ] Create auth API hooks (`src/features/auth/api/useAuth.ts`)
- [ ] Build Login page (`src/features/auth/components/LoginPage.tsx`)
- [ ] Build Register page (`src/features/auth/components/RegisterPage.tsx`)
- [ ] Create protected route wrapper (`src/routes/ProtectedRoute.tsx`)
- [ ] Create NoOrg page (`src/features/organizations/components/NoOrgPage.tsx`)
- [ ] Setup public routes (`src/routes/public.tsx`)
- [ ] Integrate auth with Axios interceptors
- [ ] Build shared components (LoadingSpinner, ErrorBoundary, ConfirmDialog)

---

## Phase 3: Multi-Tenancy Foundation

### Backend - Organization Models
- [ ] Create Organization model (`src/models/Organization.ts`)
  - Fields: id, name, slug, logo, ownerId, settings
  - Apply numericIdPlugin and soft delete
- [ ] Create Membership model (`src/models/Membership.ts`)
  - Fields: id, orgId, userId, roleId, permissions, status
- [ ] Create Role model (`src/models/Role.ts`)
  - Fields: id, name, displayName, isSystem, orgId, permissions
- [ ] Create role seeder (`src/seeds/roles.seed.ts`)
  - Seed: org_admin, manager, technician with default permissions

### Backend - Organization Endpoints
- [ ] Create slug utility (`src/utils/slug.ts`)
  - generateSlug(name)
  - ensureUniqueSlug(slug)
- [ ] Create org validator (`src/validators/org.validator.ts`)
- [ ] Create org service (`src/services/org.service.ts`)
- [ ] Create org controller (`src/controllers/org.controller.ts`)
  - listOrganizations
  - createOrganization
  - getOrganization
  - updateOrganization
  - deleteOrganization
  - switchOrganization
  - checkSlugAvailability
- [ ] Create org routes (`src/routes/org.routes.ts`)
- [ ] Create org context middleware (`src/middleware/org.middleware.ts`)

### Frontend - Organization UI
- [ ] Create org types (`src/types/org.types.ts`)
- [ ] Create org store (`src/store/orgStore.ts`)
- [ ] Create org API hooks (`src/features/organizations/api/useOrganizations.ts`)
- [ ] Build CreateOrg page (`src/features/organizations/components/CreateOrgPage.tsx`)
- [ ] Build OrgSwitcher component (`src/components/layout/OrgSwitcher.tsx`)
- [ ] Build MainLayout with sidebar (`src/components/layout/MainLayout.tsx`)
- [ ] Setup protected routes with org context (`src/routes/protected.tsx`)
- [ ] Handle org routing (`/:orgSlug/*`)

---

## Phase 4: RBAC System

### Backend - Permission Infrastructure
- [ ] Create permission types/constants
- [ ] Create permission service (`src/services/permission.service.ts`)
  - getUserPermissions(userId, orgId)
  - hasPermission(userId, orgId, module, action)
  - filterFieldsByPermission(data, permissions)
- [ ] Create RBAC middleware (`src/middleware/rbac.middleware.ts`)
  - requirePermission(module, action)
  - filterResponseFields(module)

### Backend - Role Management
- [ ] Create role service (`src/services/role.service.ts`)
- [ ] Create role controller (`src/controllers/role.controller.ts`)
  - listRoles
  - createRole
  - getRole
  - updateRole
  - deleteRole
- [ ] Create role routes (`src/routes/role.routes.ts`)

### Frontend - Permission System
- [ ] Create permission types (`src/types/permission.types.ts`)
- [ ] Create permission hooks (`src/hooks/usePermissions.ts`)
  - hasPermission(module, action)
  - canRead(module)
  - canWrite(module)
  - canDelete(module)
- [ ] Create permission guard component
- [ ] Build Roles page (`src/features/roles/components/RolesPage.tsx`)
- [ ] Build RoleForm dialog
- [ ] Add permission matrix UI for role editing

---

## Phase 5: Member Management & Invitations

### Backend - Invitation System
- [ ] Create Invitation model (`src/models/Invitation.ts`)
  - Fields: id, orgId, email, roleId, invitedBy, token, expiresAt, status
- [ ] Create invitation service (`src/services/invitation.service.ts`)
- [ ] Create invitation controller (`src/controllers/invitation.controller.ts`)
  - getInvitationByToken
  - acceptInvitation
  - cancelInvitation
- [ ] Create invitation routes (`src/routes/invitation.routes.ts`)

### Backend - Member Management
- [ ] Create member service (`src/services/member.service.ts`)
- [ ] Create member controller (`src/controllers/member.controller.ts`)
  - listMembers
  - inviteMember
  - getMember
  - updateMember
  - removeMember
- [ ] Create member routes (`src/routes/member.routes.ts`)

### Frontend - Member UI
- [ ] Create member API hooks
- [ ] Build Members page (`src/features/members/components/MembersPage.tsx`)
- [ ] Build InviteMember dialog with copy-able invite link
- [ ] Build InviteLinkCopy component for sharing invite links
- [ ] Build MemberList component
- [ ] Build AcceptInvite page for invite links
- [ ] Integrate invite flow with registration

---

## Phase 6: Settings Module

### Backend - Settings
- [ ] Add settings endpoints to org controller
  - getSettings
  - updateSettings
- [ ] Add audit logging for settings changes

### Frontend - Settings UI
- [ ] Build Settings page (`src/features/settings/components/SettingsPage.tsx`)
- [ ] Build OrgSettingsForm component
- [ ] Add permission checks to settings access

---

## Phase 7: Test Module

### Backend - Test Records
- [ ] Create TestRecord model (`src/models/TestRecord.ts`)
  - Fields: id, orgId, createdBy, title, description, status, priority, notes, internalNotes
- [ ] Create test validator (`src/validators/test.validator.ts`)
- [ ] Create test service (`src/services/test.service.ts`)
  - Include record-level filtering (own vs all)
  - Include field-level filtering (internalNotes)
- [ ] Create test controller (`src/controllers/test.controller.ts`)
  - listTestRecords (with pagination)
  - createTestRecord
  - getTestRecord
  - updateTestRecord
  - deleteTestRecord
- [ ] Create test routes (`src/routes/test.routes.ts`)

### Frontend - Test Module UI
- [ ] Create test module API hooks
- [ ] Build TestModule page (`src/features/test-module/components/TestModulePage.tsx`)
- [ ] Build TestRecordList with pagination
- [ ] Build TestRecordForm dialog
- [ ] Add field-level visibility (hide internalNotes for technicians)
- [ ] Build PermissionTester component to test all permission scenarios

---

## Phase 8: Polish & Documentation

### Error Handling & UX
- [ ] Add global error boundary
- [ ] Add toast notifications (sonner or similar)
- [ ] Add loading skeletons
- [ ] Add form validation feedback
- [ ] Add 404 page
- [ ] Add error pages

### Audit Logs
- [ ] Create AuditLog model (if not done)
- [ ] Add audit logging to all sensitive operations
- [ ] Build AuditLog viewer for Org Admins

### Documentation
- [ ] Write README.md with setup instructions
- [ ] Document API endpoints (consider Swagger/OpenAPI)
- [ ] Add code comments for complex logic
- [ ] Create environment variables documentation

### Final Testing
- [ ] Test complete registration flow
- [ ] Test organization creation
- [ ] Test member invitation flow
- [ ] Test all permission scenarios
- [ ] Test org switching
- [ ] Test soft delete behavior
- [ ] Cross-browser testing

---

## Progress Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project Setup & Core Infrastructure | ⬜ Not Started |
| 2 | Authentication System | ⬜ Not Started |
| 3 | Multi-Tenancy Foundation | ⬜ Not Started |
| 4 | RBAC System | ⬜ Not Started |
| 5 | Member Management & Invitations | ⬜ Not Started |
| 6 | Settings Module | ⬜ Not Started |
| 7 | Test Module | ⬜ Not Started |
| 8 | Polish & Documentation | ⬜ Not Started |

---

## Notes

- Each phase should be completed and tested before moving to the next
- Run tests after each phase to ensure everything works
- Commit code after each major feature is complete
- Update this checklist as you progress
