# Multitenant Database Implementation Plan

## 🎯 Objective
To implement a secure and scalable multitenant database architecture for the school management system while addressing the security concerns of admin credentials.

---

## 🤔 **Strategic Decision: Email-Based vs Self-Set Credentials**

### **Your Current Dilemma:**
1. **Current approach**: System generates admin credentials (feels insecure to users)
2. **Email-based approach**: Admin sets password via email link (more secure feeling)
3. **Self-set approach**: Admin sets credentials during creation (easier testing)

### **My Recommendation: Progressive Implementation Strategy**

**Phase 1 (Immediate - 1 week): Self-Set Credentials During Creation**
- ✅ **Easier to test and develop**
- ✅ **No external email dependency**
- ✅ **Admin controls their credentials from day 1**
- ✅ **Simple migration path to email-based later**

**Phase 2 (Later - 2-3 weeks): Add Email-Based Option**
- ✅ **More professional for production**
- ✅ **Better security perception**
- ✅ **Can coexist with self-set approach**

---

## 🛠️ **Technical Implementation with Clerk**

### **Yes, Self-Service is 100% Possible with Clerk!**

#### **Option 1: Self-Set Credentials During School Creation (Recommended First)**
```typescript
// Modified createSchoolWithAdmin function
export const createSchoolWithAdminSelfSet = async (
  currentState: CurrentState,
  data: SchoolWithAdminSelfSetSchema
) => {
  try {
    console.log("Creating school with self-set admin credentials");

    // Create school first
    const school = await prisma.school.create({
      data: {
        name: data.name,
        code: data.code?.trim() || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        logo: data.logo || undefined,
        domain: data.domain || undefined,
      }
    });

    // Create admin invitation token
    const invitationToken = crypto.randomUUID();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hour expiry

    // Store invitation data (don't create Clerk user yet)
    await prisma.adminInvitation.create({
      data: {
        id: invitationToken,
        schoolId: school.id,
        adminEmail: data.adminEmail,
        adminFirstName: data.adminFirstName,
        adminLastName: data.adminLastName,
        adminUsername: data.adminUsername,
        expiresAt: tokenExpiry,
        isUsed: false,
      }
    });

    // Send invitation link (or return it for now)
    const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/setup?token=${invitationToken}`;
    
    console.log("School created, admin invitation pending:", invitationLink);
    revalidatePath("/super-admin/schools");
    
    return { 
      success: true, 
      error: false, 
      message: `School created! Admin setup link: ${invitationLink}` 
    };

  } catch (err) {
    // ...existing error handling
  }
};
```

#### **Option 2: Email-Based Invitation with Clerk (Advanced)**
```typescript
// Using Clerk Invitations API
export const createSchoolWithEmailInvitation = async (
  currentState: CurrentState,
  data: SchoolWithEmailInvitationSchema
) => {
  try {
    // Create school first
    const school = await prisma.school.create({
      data: {
        name: data.name,
        // ...other school data
      }
    });

    // Create Clerk invitation
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: data.adminEmail,
      publicMetadata: { 
        role: "admin",
        schoolId: school.id,
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
      },
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/welcome`,
    });

    // Store invitation reference
    await prisma.adminInvitation.create({
      data: {
        id: invitation.id,
        schoolId: school.id,
        adminEmail: data.adminEmail,
        clerkInvitationId: invitation.id,
        status: 'PENDING',
      }
    });

    return { 
      success: true, 
      error: false, 
      message: "School created! Invitation sent to admin email." 
    };

  } catch (err) {
    // ...error handling
  }
};
```

---

## �️ **Database Schema Updates**

### **New Tables Needed:**
```sql
-- Admin invitations table
CREATE TABLE admin_invitations (
  id VARCHAR PRIMARY KEY, -- UUID or Clerk invitation ID
  school_id VARCHAR NOT NULL REFERENCES schools(id),
  admin_email VARCHAR NOT NULL,
  admin_first_name VARCHAR NOT NULL,
  admin_last_name VARCHAR NOT NULL,
  admin_username VARCHAR NOT NULL,
  clerk_invitation_id VARCHAR, -- For Clerk-based invitations
  status VARCHAR DEFAULT 'PENDING', -- PENDING, ACCEPTED, EXPIRED
  expires_at TIMESTAMP,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update schools table for tenant isolation
ALTER TABLE schools ADD COLUMN tenant_id VARCHAR UNIQUE; -- For row-based multitenancy
ALTER TABLE schools ADD COLUMN is_setup_complete BOOLEAN DEFAULT FALSE;
```

### **Schema-Based vs Row-Based Multitenancy Decision:**

**For Your Use Case, I recommend Row-Based Multitenancy:**
- ✅ **Easier to implement with existing Prisma setup**
- ✅ **Better for shared resources (announcements, system updates)**
- ✅ **Simpler backup and maintenance**
- ✅ **More cost-effective for cloud databases**

```typescript
// Middleware for tenant isolation
export async function withTenantIsolation(userId: string) {
  // Get user's school/tenant
  const user = await prisma.admin.findUnique({
    where: { id: userId },
    include: { school: true }
  });

  if (!user?.school) {
    throw new Error('User not associated with a school');
  }

  return user.school.id; // This is the tenantId
}

// Example usage in API routes
export async function GET(request: NextRequest) {
  const { userId } = auth();
  const tenantId = await withTenantIsolation(userId);

  const students = await prisma.student.findMany({
    where: { 
      schoolId: tenantId // Automatically filter by tenant
    }
  });

  return NextResponse.json({ students });
}
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Self-Set Credentials (Week 1)**
```typescript
// 1. Update your current form to include admin credential setup
interface SchoolWithAdminSelfSetSchema {
  // School fields
  name: string;
  code?: string;
  // ...other school fields

  // Admin setup fields  
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminUsername: string;
  // No password field - they'll set it via link
}

// 2. Create admin setup page
// src/app/admin/setup/page.tsx
export default function AdminSetupPage({ 
  searchParams 
}: { 
  searchParams: { token: string } 
}) {
  // Validate token, show password setup form
  return <AdminPasswordSetupForm token={searchParams.token} />;
}

// 3. Password setup action
export const setupAdminPassword = async (
  token: string,
  password: string
) => {
  // Validate token
  const invitation = await prisma.adminInvitation.findUnique({
    where: { id: token, isUsed: false },
    include: { school: true }
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    return { error: 'Invalid or expired token' };
  }

  // Create Clerk user
  const user = await clerkClient.users.createUser({
    username: invitation.adminUsername,
    password: password,
    firstName: invitation.adminFirstName,
    lastName: invitation.adminLastName,
    emailAddress: [invitation.adminEmail],
    publicMetadata: { role: 'admin', schoolId: invitation.schoolId }
  });

  // Create admin record
  await prisma.admin.create({
    data: {
      id: user.id,
      username: invitation.adminUsername,
      schoolId: invitation.schoolId,
    }
  });

  // Mark invitation as used
  await prisma.adminInvitation.update({
    where: { id: token },
    data: { isUsed: true }
  });

  return { success: true };
};
```

### **Phase 2: Email Integration (Later)**
```typescript
// Add email service (later)
import { sendEmail } from '@/lib/email-service';

// In createSchoolWithAdminSelfSet, add:
await sendEmail({
  to: data.adminEmail,
  subject: `Welcome to ${data.name} - Set up your admin account`,
  template: 'admin-invitation',
  data: {
    schoolName: data.name,
    adminName: data.adminFirstName,
    setupLink: invitationLink,
    expiresIn: '24 hours'
  }
});
```

---

## 🔍 **Migration Concerns - They're Actually Minimal!**

### **Why Migration to Email-Based Won't Be Hard:**
1. **Same database structure** - AdminInvitation table works for both approaches
2. **Same Clerk integration** - Just timing of user creation changes
3. **Same UI components** - Password setup form is reusable
4. **Progressive enhancement** - Can offer both options

### **Migration Strategy:**
```typescript
// You can even support both approaches simultaneously
export const createSchoolWithAdmin = async (
  currentState: CurrentState,
  data: SchoolWithAdminSchema,
  method: 'self-set' | 'email-invitation' = 'self-set'
) => {
  if (method === 'self-set') {
    return createSchoolWithAdminSelfSet(currentState, data);
  } else {
    return createSchoolWithEmailInvitation(currentState, data);
  }
};
```

---

## 🎯 **Recommendation: Start with Self-Set**

### **Benefits for Testing & Development:**
- ✅ **No email service setup needed initially**
- ✅ **Faster testing cycles**
- ✅ **Admin feels in control of credentials**
- ✅ **Easy to demo to stakeholders**
- ✅ **Simple to add email later**

### **Teacher/Student Creation Strategy:**
Apply the same pattern to teacher/student creation:
```typescript
// Instead of generating passwords, create invitation tokens
export const createTeacherInvitation = async (teacherData) => {
  // Create invitation token
  // Send/display setup link
  // Teacher sets their own password
};
```

---

## ✅ **Next Steps:**
1. **Update SchoolWithAdminForm** to remove password field
2. **Create AdminInvitation table** in your schema
3. **Implement admin setup page** (`/admin/setup`)
4. **Test the self-set flow** thoroughly
5. **Later**: Add email service and email-based invitations

This approach gives you the best of both worlds - immediate implementation benefits with a clear path to production-ready email invitations!

---

### **2. Multitenant Database Architecture**

#### **Current Issue:**
- All schools share the same database schema, which may lead to data isolation concerns.

#### **Proposed Solution:**
- **Schema-Based Multitenancy:**
  - Each school gets its own schema within the same database.
  - Example: `school_1`, `school_2`, etc.

- **Row-Based Multitenancy:**
  - Use a single schema but add a `tenant_id` column to every table to isolate data.

#### **Comparison:**
| Feature                  | Schema-Based                  | Row-Based                     |
|--------------------------|-------------------------------|-------------------------------|
| **Data Isolation**       | High                         | Medium                        |
| **Scalability**          | Medium                       | High                          |
| **Complexity**           | High                         | Low                           |
| **Use Case**             | Few tenants, high isolation  | Many tenants, shared schema   |

#### **Implementation Steps:**
1. **Schema-Based:**
   - Create a new schema for each school.
   - Use Prisma's `schema` feature to manage multiple schemas.

2. **Row-Based:**
   - Add a `tenant_id` column to all tables.
   - Use middleware to filter queries by `tenant_id`.

3. **Hybrid Approach:**
   - Use schema-based for critical data (e.g., financial records).
   - Use row-based for shared data (e.g., announcements).

---

## 🔐 Security Enhancements

### **1. Data Encryption:**
- Encrypt sensitive data (e.g., admin credentials, financial records) at rest using AES-256.
- Use SSL/TLS for data in transit.

### **2. Audit Logs:**
- Track all admin actions (e.g., login, data changes) for accountability.
- Store logs in a secure, tamper-proof system.

### **3. Role-Based Access Control (RBAC):**
- Define roles (e.g., super admin, school admin, teacher, parent) with specific permissions.
- Use middleware to enforce role-based access to APIs.

---

## 🛠️ Implementation Roadmap

### **Phase 1: Secure Admin Credential Management (2 weeks)**
- [ ] Implement email invitation flow for password setup.
- [ ] Create password setup and reset endpoints.
- [ ] Enforce strong password policies.
- [ ] Add 2FA support.

### **Phase 2: Multitenant Database Architecture (3 weeks)**
- [ ] Decide on schema-based vs. row-based approach.
- [ ] Update database schema to support multitenancy.
- [ ] Implement middleware for tenant isolation.
- [ ] Test data isolation and performance.

### **Phase 3: Security Enhancements (2 weeks)**
- [ ] Implement data encryption at rest and in transit.
- [ ] Set up audit logging.
- [ ] Enforce RBAC across the application.

---

## 🎯 Success Metrics
- **Admin Trust:** 90% of admins feel their credentials are secure.
- **Data Isolation:** No data leaks between tenants.
- **Performance:** API response time < 500ms for 95% of requests.
- **Security:** No critical vulnerabilities in penetration tests.

---

*This plan addresses the security concerns of admin credentials while ensuring scalability and data isolation for a multitenant architecture.*
