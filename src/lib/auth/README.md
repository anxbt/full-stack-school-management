# Authentication & School Context System

This document explains the new authentication and school context system implemented for the school management application.

## 📁 File Structure

```
src/lib/
├── auth/
│   ├── index.ts              # Main exports (barrel file)
│   ├── user-context.ts       # User authentication functions
│   ├── school-context.ts     # School context management
│   └── examples.ts           # Usage examples
├── services/
│   └── school-service.ts     # School business logic
├── types/
│   └── auth.ts               # TypeScript types and errors
└── actions.ts                # Updated with new auth system
```

## 🎯 Key Features

### 1. **User Authentication**
- Get current user information from Clerk
- Role-based access control
- Type-safe user context

### 2. **School Context Management**
- Automatic school ID resolution based on user role
- SuperAdmin multi-school support
- School access validation

### 3. **Role-Based Permissions**
- Admin, Teacher, Student, Parent, SuperAdmin roles
- Role verification functions
- Permission enforcement

### 4. **Multi-Tenant Support**
- School isolation
- Cross-school access prevention
- SuperAdmin school switching

## 🚀 How to Use

### Basic Authentication

```typescript
import { getCurrentUser, getCurrentUserSchoolId } from "@/lib/auth";

// Get current user
const user = await getCurrentUser();
console.log(user.role, user.id, user.email);

// Get user's school ID
const schoolId = await getCurrentUserSchoolId();
```

### Role-Based Access

```typescript
import { requireRole, requireAnyRole } from "@/lib/auth";

// Require specific role
await requireRole("admin");

// Require any of multiple roles
await requireAnyRole(["teacher", "admin"]);
```

### SuperAdmin Operations

```typescript
import { getSuperAdminSchools, getSuperAdminSchoolId } from "@/lib/auth";

// Get all schools SuperAdmin can access
const schools = await getSuperAdminSchools();

// Get school ID for SuperAdmin with optional selection
const schoolId = await getSuperAdminSchoolId(selectedSchoolId);
```

### School Service

```typescript
import { SchoolService } from "@/lib/auth";

// Automatically handles both regular users and SuperAdmins
const schoolId = await SchoolService.getContextualSchoolId(superAdminSelectedSchoolId);

// Get school details and stats
const school = await SchoolService.getSchoolById(schoolId);
const stats = await SchoolService.getSchoolStats(schoolId);
```

## 🔐 Security Features

### 1. **Automatic School Isolation**
```typescript
// Before: Could access any school's data
await prisma.student.findMany(); // ❌ No school filtering

// After: Automatically filtered by user's school
const schoolId = await getCurrentUserSchoolId();
await prisma.student.findMany({ where: { schoolId } }); // ✅ School isolated
```

### 2. **Role Verification**
```typescript
// Automatically throws error if user doesn't have required role
await requireRole("admin");
// Code after this line only runs for admins
```

### 3. **School Access Validation**
```typescript
// Verify user has access to specific school
await requireSchoolAccess(schoolId);
// Safe to access school data
```

## 📊 User Role Mapping

| Role | School Access | Permissions |
|------|---------------|-------------|
| **SuperAdmin** | Multiple schools | Full access to all schools |
| **Admin** | Single school | Full access to their school |
| **Teacher** | Single school | Limited access to their school |
| **Student** | Single school | Read-only access to their data |
| **Parent** | Single school | Read-only access to their children's data |

## 🔄 Migration from Old System

### Before (Old getSchoolId function):
```typescript
// ❌ Always returned first school, no user context
async function getSchoolId(): Promise<string> {
  const firstSchool = await prisma.school.findFirst();
  return firstSchool?.id || "school-1";
}
```

### After (New system):
```typescript
// ✅ Returns user's actual school based on their role and association
const schoolId = await getCurrentUserSchoolId();
```

## 🛠️ Implementation Steps Completed

### ✅ Step 1: User Context System
- Created `user-context.ts` with Clerk integration
- Added role-based authentication functions
- Implemented user validation and permissions

### ✅ Step 2: School Context System
- Created `school-context.ts` with school management
- Added automatic school ID resolution
- Implemented SuperAdmin multi-school support

### ✅ Step 3: Service Layer
- Created `SchoolService` for business logic
- Added school validation and statistics
- Implemented contextual school operations

### ✅ Step 4: Integration
- Updated `actions.ts` to use new auth system
- Replaced old `getSchoolId()` with `getCurrentUserSchoolId()`
- Added proper error handling

## 🔮 Next Steps (Recommended)

### Phase 1: UI Integration
```typescript
// Create school switcher for SuperAdmin
// Add role-based navigation
// Implement access denied pages
```

### Phase 2: Middleware Protection
```typescript
// Add route-based access control
// Implement school context middleware
// Add automatic redirections
```

### Phase 3: Advanced Features
```typescript
// School selection persistence (cookies/session)
// Audit logging for cross-school access
// Advanced permission system
```

## 🐛 Error Handling

The system provides two main error types:

### AuthError
- `UNAUTHENTICATED`: User not logged in
- `USER_NOT_FOUND`: User not found in Clerk
- `ROLE_NOT_FOUND`: User role not set
- `INSUFFICIENT_PERMISSIONS`: User lacks required role

### SchoolAccessError
- User not associated with any school
- SuperAdmin needs school selection
- Invalid school access attempt

## 📝 Usage Examples

See `src/lib/auth/examples.ts` for comprehensive usage examples including:
- Basic authentication patterns
- Role-based access control
- SuperAdmin operations
- Error handling patterns
- School service usage

## 🎉 Benefits

✅ **Security**: Users can only access their own school's data  
✅ **Type Safety**: Full TypeScript support with proper error types  
✅ **Scalability**: Supports unlimited schools and users  
✅ **Flexibility**: SuperAdmin can manage multiple schools  
✅ **Maintainability**: Clean separation of concerns  
✅ **Developer Experience**: Easy-to-use API with examples  

Your school management system is now properly multi-tenant and secure! 🚀