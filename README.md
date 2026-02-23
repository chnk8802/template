# MERN + shadcn/ui Multi-Tenant Starter Template

A production-ready full-stack starter template with multi-tenancy, RBAC, JWT authentication, and MongoDB transactions.

## 🚀 Features

- **Authentication**: JWT-based auth with access tokens (15min) and refresh tokens (7 days)
- **Multi-Tenancy**: Shared database with `orgId` in every collection, URL-based org context (`/:orgSlug/...`)
- **RBAC**: Three roles - Org Admin, Manager, Technician with hierarchical permissions
- **MongoDB Transactions**: Atomic operations for data consistency
- **Soft Deletes**: All entities support soft delete with `deletedAt` field
- **Numeric IDs**: 24-digit numeric-only IDs using nanoid
- **Protected Routes**: Route-level authentication and authorization

## 📁 Project Structure

```
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/       # Auth-related components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── features/       # Feature-based modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── org/        # Organization management
│   │   │   ├── settings/   # User/Org settings
│   │   │   └── test/       # Test module (example)
│   │   ├── lib/            # Utilities and API client
│   │   ├── router/         # React Router configuration
│   │   ├── store/          # Zustand stores
│   │   └── types/          # TypeScript types
│   └── ...
├── server/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities
│   │   └── validators/     # Zod schemas
│   └── ...
└── package.json            # Workspace configuration
```

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js 18+
- MongoDB 6.0+
- npm or yarn

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Install dependencies for both client and server
npm install
```

### 2. Environment Setup

Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Servers

```bash
# Start both client and server
npm run dev

# Or start individually
npm run dev:server  # Backend on port 5000
npm run dev:client  # Frontend on port 5173
```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orgs` | Create organization |
| GET | `/api/orgs` | Get user's organizations |
| GET | `/api/orgs/:orgSlug` | Get organization by slug |
| PUT | `/api/orgs/:orgSlug` | Update organization |
| GET | `/api/orgs/:orgSlug/members` | Get organization members |
| POST | `/api/orgs/:orgSlug/invitations` | Invite member |
| GET | `/api/orgs/:orgSlug/invitations` | Get pending invitations |
| PUT | `/api/orgs/:orgSlug/members/:memberId/role` | Update member role |
| DELETE | `/api/orgs/:orgSlug/members/:memberId` | Remove member |
| POST | `/api/orgs/accept-invitation` | Accept invitation |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/profile` | Get user profile |
| PUT | `/api/settings/profile` | Update profile |
| POST | `/api/settings/change-password` | Change password |
| GET | `/api/settings/org/:orgSlug` | Get org settings |
| PUT | `/api/settings/org/:orgSlug` | Update org settings |

### Tests (Example Module)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:orgSlug/tests` | List tests |
| POST | `/:orgSlug/tests` | Create test |
| GET | `/:orgSlug/tests/:testId` | Get test |
| PUT | `/:orgSlug/tests/:testId` | Update test |
| DELETE | `/:orgSlug/tests/:testId` | Delete test |

## 🔐 Role-Based Access Control

### Roles (in order of hierarchy)
1. **Org Admin** - Full organization access
   - Manage all members and roles
   - Update organization settings
   - Delete organization
   
2. **Manager** - Team management
   - Invite new members
   - Manage technicians
   - Create/update/delete tests
   
3. **Technician** - Basic access
   - View organization data
   - View tests

### Permission Rules
- Org Admins can manage anyone
- Managers can only manage Technicians
- Cannot remove/demote the last Org Admin
- All roles can view organization data

## 🗄 Database Schema

### Users
```typescript
{
  _id: string;           // 24-digit numeric ID
  email: string;
  password: string;      // bcrypt hashed
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Organizations
```typescript
{
  _id: string;
  name: string;
  slug: string;          // URL-friendly identifier
  logo?: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: {
    allowMemberInvites: boolean;
    defaultRole: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Memberships
```typescript
{
  _id: string;
  userId: string;
  orgId: string;
  role: 'org_admin' | 'manager' | 'technician';
  status: 'active' | 'inactive' | 'pending';
  invitedBy?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Invitations
```typescript
{
  _id: string;
  email: string;
  orgId: string;
  role: 'org_admin' | 'manager' | 'technician';
  token: string;         // Unique invitation token
  invitedBy: string;
  expiresAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

## 🔧 Adding New Modules

### 1. Create Model (server/src/models/)
```typescript
// Example.ts
import mongoose, { Schema, Document } from 'mongoose';
import { numericIdPlugin, softDeletePlugin, timestampsPlugin } from '../utils/numericId.js';

export interface IExample extends Document {
  _id: string;
  orgId: string;  // Required for multi-tenancy
  // ... other fields
}

const exampleSchema = new Schema<IExample>({
  _id: { type: String, required: true },
  orgId: { type: String, ref: 'Organization', required: true, index: true },
  // ... other fields
});

exampleSchema.plugin(numericIdPlugin);
exampleSchema.plugin(timestampsPlugin);
exampleSchema.plugin(softDeletePlugin);

export const Example = mongoose.model<IExample>('Example', exampleSchema);
```

### 2. Create Validator (server/src/validators/)
```typescript
// example.validator.ts
import { z } from 'zod';

export const createExampleSchema = z.object({
  name: z.string().min(1).max(100),
  // ... other fields
});

export type CreateExampleInput = z.infer<typeof createExampleSchema>;
```

### 3. Create Service (server/src/services/)
```typescript
// example.service.ts
import { Example } from '../models/Example.js';
import { generateNumericId } from '../utils/numericId.js';

export const createExample = async (orgId: string, data: CreateExampleInput) => {
  const id = await generateNumericId('examples');
  return Example.create({ _id: id, orgId, ...data });
};

export const getExamples = async (orgId: string) => {
  return Example.find({ orgId, deletedAt: null });
};
```

### 4. Create Controller (server/src/controllers/)
```typescript
// example.controller.ts
import * as exampleService from '../services/example.service.js';
import { sendSuccess, errorResponses } from '../utils/response.js';

export const createExample = async (req, res, next) => {
  try {
    const org = req.org;  // Set by loadOrgContext middleware
    const example = await exampleService.createExample(org._id, req.body);
    sendSuccess(res, example, 'Created', 201);
  } catch (error) {
    next(error);
  }
};
```

### 5. Create Routes (server/src/routes/)
```typescript
// example.routes.ts
import { Router } from 'express';
import * as controller from '../controllers/example.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loadOrgContext, requireMember } from '../middleware/rbac.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/:orgSlug/examples', loadOrgContext, requireMember, controller.getExamples);
router.post('/:orgSlug/examples', loadOrgContext, requireMember, controller.createExample);

export default router;
```

### 6. Add to App (server/src/app.ts)
```typescript
import exampleRoutes from './routes/example.routes.js';
app.use('/api', exampleRoutes);
```

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
