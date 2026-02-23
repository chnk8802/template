# MERN Multi-Tenant Starter - Quick Summary

## What We're Building

A **starter template** for building SaaS applications with:
- User registration and login
- Organization management (multi-tenant)
- Role-based access control (RBAC)
- Protected routes and permissions

---

## Tech Stack (Simple)

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + shadcn/ui + Tailwind |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (Access + Refresh Tokens) |
| State | Zustand + TanStack Query |

---

## User Roles

```
┌─────────────┐
│  Org Admin  │  ← Highest role, can do everything
├─────────────┤
│   Manager   │  ← Can manage records, limited settings
├─────────────┤
│ Technician  │  ← Can read/write own records only
└─────────────┘
```

---

## Key Features

### 1. Multi-Tenancy
- Every user can create multiple organizations
- Each organization has its own data (isolated by `orgId`)
- URL pattern: `app.com/:orgSlug/module`

### 2. Authentication
- Open registration (anyone can sign up)
- Login with email + password
- JWT tokens for API access

### 3. Permissions (3 Levels)
- **Module Level**: Can user access this module? (read/write/delete)
- **Record Level**: Can user see all records or only their own?
- **Field Level**: Can user see/edit specific fields?

### 4. Invitation System
- Org Admin invites users by email
- Invite link displayed in UI for manual sharing (no email for MVP)
- New users register via invite link
- Existing users auto-join the org

---

## Database Collections (8 Total)

| Collection | Purpose |
|------------|---------|
| Users | User accounts |
| Organizations | Tenant organizations |
| Memberships | User-org relationships with roles |
| Roles | Permission definitions |
| Invitations | Pending invite tokens |
| RefreshTokens | Active sessions |
| AuditLogs | Action history |
| TestRecords | Demo module for testing permissions |

---

## Project Structure

```
project/
├── client/          # React frontend
│   └── src/
│       ├── components/    # UI components
│       ├── features/      # Feature modules
│       ├── hooks/         # Custom hooks
│       ├── store/         # Zustand stores
│       └── routes/        # Route definitions
│
└── server/          # Express backend
    └── src/
        ├── controllers/   # Request handlers
        ├── models/        # Database models
        ├── routes/        # API routes
        ├── services/      # Business logic
        └── middleware/    # Auth, RBAC, etc.
```

---

## API Endpoints Overview

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Organizations
- `GET /api/orgs` - List my organizations
- `POST /api/orgs` - Create organization
- `GET /api/orgs/:slug` - Get organization
- `POST /api/orgs/:slug/switch` - Switch context

### Members
- `GET /api/orgs/:slug/members` - List members
- `POST /api/orgs/:slug/members/invite` - Invite member
- `PUT /api/orgs/:slug/members/:id` - Update role
- `DELETE /api/orgs/:slug/members/:id` - Remove member

### Invitations
- `GET /api/invitations/:token` - Get invite details
- `POST /api/invitations/:token/accept` - Accept invite

---

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/register` | Registration page |
| `/create-org` | Create new organization |
| `/:orgSlug` | Organization dashboard |
| `/:orgSlug/members` | Member management |
| `/:orgSlug/roles` | Role management |
| `/:orgSlug/settings` | Organization settings |
| `/:orgSlug/test-module` | Test permissions module |

---

## Quick Flow Diagrams

### User Registration Flow
```
User fills form → Account created → Auto-login → Redirect to create-org
```

### Create Organization Flow
```
Enter org name → Generate slug → Create org → User becomes Org Admin
```

### Invite Member Flow
```
Org Admin enters email → Generate invite link → Display link for copying →
Org Admin shares link manually → User opens link →
If new: Register → Auto-join org
If existing: Auto-login → Auto-join org
```

---

## IDs Format

All IDs are **24-digit numbers only** (no letters, no dashes):
- Example: `550840029414671644665544`
- Generated using `nanoid` with numeric alphabet

---

## Soft Deletes

All deletions are **soft deletes**:
- Records are marked with `deletedAt` timestamp
- Data can be recovered if needed
- Queries automatically filter out deleted records

---

## What's NOT in MVP

These features are deferred for later:
- ❌ Email verification
- ❌ Password reset
- ❌ File uploads (avatars, logos)
- ❌ Real-time updates (WebSocket)
- ❌ Billing/subscription

---

## Ready to Start?

The complete architecture plan is in [`mern-starter-architecture.md`](./mern-starter-architecture.md)

The implementation checklist is in [`IMPLEMENTATION-CHECKLIST.md`](./IMPLEMENTATION-CHECKLIST.md)
