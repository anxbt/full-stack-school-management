# School Admin Creation Implementation Plan

## Overview

This document outlines the implementation plan for creating school administrator accounts when adding new schools in the super-admin dashboard. The process will create both a school record in the database and a corresponding admin user in Clerk with the appropriate role permissions.

## Requirements

1. Super-admin should be able to create a new school and its admin simultaneously
2. School admin credentials (username, password) should be securely generated
3. Newly created admin should have the "admin" role in Clerk's public metadata
4. The admin should be associated with the specific school in the database
5. Provide feedback to super-admin about successful account creation

## Implementation Steps

### 1. Update School Form Schema

Extend the existing `schoolSchema` in `formValidationSchemas.ts`:

```typescript
export const schoolWithAdminSchema = schoolSchema.extend({
  adminUsername: z.string().min(3, { message: "Admin username must be at least 3 characters long!" }),
  adminPassword: z.string().min(8, { message: "Admin password must be at least 8 characters long!" }),
  adminName: z.string().min(1, { message: "Admin name is required!" }),
  adminSurname: z.string().min(1, { message: "Admin surname is required!" }),
  adminEmail: z.string().email({ message: "Valid email is required!" }).optional(),
});

export type SchoolWithAdminSchema = z.infer<typeof schoolWithAdminSchema>;
```

### 2. Update the School Form Component

Create a new form component `SchoolWithAdminForm.tsx` that extends the existing `SchoolForm` to include admin fields:

```typescript
// Add admin credential fields to the form
const SchoolWithAdminForm = ({ initialData }: SchoolFormProps) => {
  // Existing form code...
  
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Create a new school with admin</h1>
      
      {/* School Information Section */}
      <div className="bg-white p-4 rounded-md">
        <h2 className="text-lg font-medium mb-4">School Information</h2>
        {/* Existing school fields... */}
      </div>
      
      {/* Admin Information Section */}
      <div className="bg-white p-4 rounded-md">
        <h2 className="text-lg font-medium mb-4">School Administrator</h2>
        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Admin Username"
            name="adminUsername"
            register={register}
            error={errors?.adminUsername}
            inputProps={{ required: true }}
          />
          <InputField
            label="Admin Password"
            name="adminPassword"
            register={register}
            error={errors?.adminPassword}
            inputProps={{ type: "password", required: true }}
          />
          <InputField
            label="Admin First Name"
            name="adminName"
            register={register}
            error={errors?.adminName}
            inputProps={{ required: true }}
          />
          <InputField
            label="Admin Last Name"
            name="adminSurname"
            register={register}
            error={errors?.adminSurname}
            inputProps={{ required: true }}
          />
          <InputField
            label="Admin Email (optional)"
            name="adminEmail"
            register={register}
            error={errors?.adminEmail}
          />
        </div>
      </div>
      
      {/* Form submission buttons */}
      {/* ... */}
    </form>
  );
};
```

### 3. Create Server Action for School and Admin Creation

Create a new server action `createSchoolWithAdmin` in `actions.ts`:

```typescript
export const createSchoolWithAdmin = async (
  currentState: CurrentState,
  data: SchoolWithAdminSchema
) => {
  try {
    console.log("Creating school with admin:", data);
    
    // 1. Create user in Clerk
    const user = await clerkClient.users.createUser({
      username: data.adminUsername,
      password: data.adminPassword,
      firstName: data.adminName,
      lastName: data.adminSurname,
      emailAddress: [data.adminEmail],
      publicMetadata: { role: "admin" }
    });
    
    // Extract admin data for database
    const adminData = {
      id: user.id,
      username: data.adminUsername,
      img: null, // Can be updated later
    };
    
    // 2. Create school with connected admin in database
    const schoolData: any = {
      name: data.name,
      address: data.address || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      logo: data.logo || undefined,
      domain: data.domain || undefined,
      // Create admin and connect it to the school
      admins: {
        create: [adminData]
      }
    };
    
    // Only add code if it's not empty
    if (data.code && data.code.trim() !== '') {
      schoolData.code = data.code;
    }
    
    const school = await prisma.school.create({
      data: schoolData,
      include: {
        admins: true,
      }
    });

    console.log("School and admin created successfully:", school);
    revalidatePath("/super-admin/schools");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating school with admin:", err);
    
    // Handle specific error types
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      if (prismaError.meta?.target?.includes('code')) {
        return { success: false, error: true, message: "School code already exists" };
      }
      if (prismaError.meta?.target?.includes('username')) {
        return { success: false, error: true, message: "Admin username already exists" };
      }
    }
    
    // If it's a Clerk error
    if (err.errors && Array.isArray(err.errors)) {
      const clerkError = err.errors[0];
      if (clerkError.code === "form_identifier_exists") {
        return { success: false, error: true, message: "Admin username or email already exists" };
      }
    }
    
    return { success: false, error: true };
  }
};
```

### 4. Update the Create School Page

Modify the existing create school page to use the new form:

```typescript
import { Metadata } from "next";
import SchoolWithAdminForm from "@/components/forms/SchoolWithAdminForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create School | School Management System",
  description: "Create a new school with admin in the school management system",
};

const CreateSchoolPage = async () => {
  const { userId } = auth();
  
  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-semibold">Create New School with Admin</h1>
      </div>
      
      <div className="flex items-center text-sm mb-6">
        <Link href="/super-admin" className="text-gray-500 hover:text-lamaPurple">
          Dashboard
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link href="/super-admin/schools" className="text-gray-500 hover:text-lamaPurple">
          Schools
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-lamaPurple">Create</span>
      </div>
      
      <div className="bg-white p-6 rounded-md shadow-sm">
        <SchoolWithAdminForm />
      </div>
      
      {/* Guidelines section */}
    </div>
  );
};

export default CreateSchoolPage;
```

## Data Flow

1. Super-admin fills out the school creation form with admin details
2. Form submission triggers the `createSchoolWithAdmin` server action
3. Server action creates a new user in Clerk with the "admin" role
4. Server action creates a new school in the database with the connected admin
5. On success, super-admin is redirected to the schools list page
6. On error, appropriate error messages are displayed

## Security Considerations

1. **Password Security**:
   - Enforce strong password policies
   - Don't store passwords in the database (handled by Clerk)
   - Consider generating a secure random password and displaying it once to the super-admin

2. **Role-Based Access Control**:
   - Set the role in Clerk's public metadata
   - Update middleware to check for the "admin" role when accessing admin routes

3. **Audit Trail**:
   - Log admin creation activities for security audit purposes
   - Record who created each admin account (the super-admin's ID)

## UI Enhancements

1. **Password Generator**:
   - Add a "Generate Secure Password" button
   - Show password strength indicator

2. **Confirmation Modal**:
   - Show a confirmation modal with the created admin credentials
   - Option to copy credentials to clipboard

3. **Email Notification**:
   - Send welcome email to the new admin with their credentials
   - Include a link to set up two-factor authentication

## Testing Strategy

1. **Unit Tests**:
   - Test validation rules for admin credentials
   - Test the school creation with admin function

2. **Integration Tests**:
   - Test the full flow from form submission to database creation
   - Test error handling for duplicate usernames/codes

3. **E2E Tests**:
   - Test the complete user journey from super-admin login to school creation to admin login

## Admin Credential Management and Recovery

### Initial Credential Handover

When a super-admin creates a new school with admin credentials, the system needs a secure way to communicate these initial credentials to the school admin:

1. **Secure Credential Display**:
   - After successful school and admin creation, display the credentials on a success screen only once
   - Include a warning that these credentials won't be shown again
   - Provide a "Copy to Clipboard" button for convenience
   - Show a countdown before the credentials are hidden (e.g., 60 seconds)

2. **Email Notification**:
   - Send a welcome email to the school admin's email address with:
     - Username (but not password for security reasons)
     - A link to set up their account with a temporary access token
     - Instructions to change their password immediately upon first login
   - Set email expiration (24-48 hours)

3. **Admin Notification Dashboard**:
   - Create a notification in the super-admin dashboard showing pending credential handovers
   - Allow manually resending welcome emails if needed

### Password Change Functionality

School admins should be able to change their password easily after receiving initial credentials:

1. **First-Login Forced Password Change**:
   - When a school admin logs in for the first time, force them to change their password
   - Implement this using Clerk's hooks or custom middleware checks
   - Validate that the new password meets security requirements
   - Prevent reuse of the initial password

2. **Self-Service Password Change**:
   - Create a dedicated "Account Settings" page for admins
   - Include a password change form that requires:
     - Current password verification
     - New password input (with strength indicator)
     - Confirmation of new password
   - Implement using Clerk's user update functionality:
   
   ```typescript
   // Account settings component (client-side)
   "use client";
   
   import { useState } from "react";
   import { useUser } from "@clerk/nextjs";
   
   const AccountSettings = () => {
     const { user } = useUser();
     const [currentPassword, setCurrentPassword] = useState("");
     const [newPassword, setNewPassword] = useState("");
     const [confirmPassword, setConfirmPassword] = useState("");
     const [error, setError] = useState("");
     const [success, setSuccess] = useState(false);
     
     const handlePasswordChange = async (e) => {
       e.preventDefault();
       setError("");
       setSuccess(false);
       
       if (newPassword !== confirmPassword) {
         setError("New passwords don't match");
         return;
       }
       
       try {
         await user.updatePassword({
           currentPassword,
           newPassword,
         });
         setSuccess(true);
         setCurrentPassword("");
         setNewPassword("");
         setConfirmPassword("");
       } catch (err) {
         setError(err.message || "Failed to update password");
       }
     };
     
     return (
       <div className="bg-white p-6 rounded-md shadow-sm">
         <h2 className="text-xl font-semibold mb-4">Change Password</h2>
         
         {success && (
           <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
             Password updated successfully
           </div>
         )}
         
         {error && (
           <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
             {error}
           </div>
         )}
         
         <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
           <div>
             <label className="block text-sm text-gray-600 mb-1">
               Current Password
             </label>
             <input
               type="password"
               value={currentPassword}
               onChange={(e) => setCurrentPassword(e.target.value)}
               required
               className="w-full p-2 border rounded-md"
             />
           </div>
           
           <div>
             <label className="block text-sm text-gray-600 mb-1">
               New Password
             </label>
             <input
               type="password"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               required
               className="w-full p-2 border rounded-md"
             />
           </div>
           
           <div>
             <label className="block text-sm text-gray-600 mb-1">
               Confirm New Password
             </label>
             <input
               type="password"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               required
               className="w-full p-2 border rounded-md"
             />
           </div>
           
           <button
             type="submit"
             className="bg-lamaPurple text-white p-2 px-4 rounded-md mt-2"
           >
             Update Password
           </button>
         </form>
       </div>
     );
   };
   
   export default AccountSettings;
   ```

### Password Recovery System

Implement a robust password recovery system for school admins who forget their passwords:

1. **Forgot Password Flow**:
   - Create a "Forgot Password" link on the login screen
   - Implement using Clerk's built-in password reset functionality
   
   ```typescript
   // Login page component
   import { SignIn } from "@clerk/nextjs";
   
   const LoginPage = () => {
     return (
       <div className="flex items-center justify-center min-h-screen bg-gray-50">
         <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
           <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" 
             appearance={{
               elements: {
                 formButtonPrimary: "bg-lamaPurple hover:bg-purple-700 text-white",
                 card: "shadow-none",
               }
             }}
           />
         </div>
       </div>
     );
   };
   
   export default LoginPage;
   ```

2. **Multi-Channel Verification**:
   - Implement verification through multiple channels:
     - Email verification code
     - SMS verification (if phone is available)
   - Use Clerk's built-in verification mechanisms
   
3. **Super-Admin Assisted Reset**:
   - Create an admin management interface for super-admins
   - Allow super-admins to trigger password resets for school admins:
   
   ```typescript
   // Admin management action in actions.ts
   export const resetAdminPassword = async (
     currentState: CurrentState,
     data: { adminId: string }
   ) => {
     try {
       // Generate temporary password
       const tempPassword = generateSecurePassword(12);
       
       // Update admin password in Clerk
       await clerkClient.users.updateUser(data.adminId, {
         password: tempPassword,
         passwordDigest: null
       });
       
       // Get admin email
       const admin = await prisma.admin.findUnique({
         where: { id: data.adminId }
       });
       
       // Send email with temporary password
       // ... email sending logic here
       
       return { 
         success: true, 
         error: false, 
         tempPassword // Only for display to super-admin
       };
     } catch (err) {
       console.error("Error resetting admin password:", err);
       return { success: false, error: true };
     }
   };
   ```

### Username Change Process

Allow school admins to change their username while maintaining system integrity:

1. **Username Change Form**:
   - Add a username change form to the Account Settings page
   - Require password verification for username changes
   - Check for username availability before submission

2. **Database Update Process**:
   ```typescript
   export const changeAdminUsername = async (
     currentState: CurrentState,
     data: { adminId: string, newUsername: string, password: string }
   ) => {
     try {
       // Verify password first through Clerk
       const verification = await clerkClient.users.verifyPassword({
         userId: data.adminId,
         password: data.password
       });
       
       if (!verification.valid) {
         return { success: false, error: true, message: "Incorrect password" };
       }
       
       // Update username in Clerk
       await clerkClient.users.updateUser(data.adminId, {
         username: data.newUsername
       });
       
       // Update username in database
       await prisma.admin.update({
         where: { id: data.adminId },
         data: { username: data.newUsername }
       });
       
       return { success: true, error: false };
     } catch (err) {
       console.error("Error changing admin username:", err);
       
       if (err.errors && err.errors[0]?.code === "form_identifier_exists") {
         return { success: false, error: true, message: "Username already exists" };
       }
       
       return { success: false, error: true };
     }
   };
   ```

### Security Considerations for Credential Management

1. **Audit Logging**:
   - Log all credential changes (creation, password changes, resets)
   - Include timestamp, actor (who made the change), and affected user
   - Don't log actual passwords or security tokens

2. **Rate Limiting**:
   - Implement rate limiting for password reset attempts
   - Block access after multiple failed login attempts
   - Use Clerk's built-in protection features

3. **Session Management**:
   - Invalidate all active sessions when a password is changed
   - Force re-login after critical security changes
   - Implement with Clerk's session management:
   
   ```typescript
   // After password change
   await user.sessions.revokeAll();
   ```

4. **Notifications**:
   - Send email notifications for all credential changes
   - Include IP address and device information
   - Provide instructions to contact support if the change wasn't authorized

### Implementation Timeline for Credential Management

1. **Phase 1 - Basic Functionality**:
   - Implement initial credential creation for school admins
   - Create the "Change Password" functionality
   - Implement Clerk's default password reset flow

2. **Phase 2 - Enhanced Security**:
   - Add username change capability
   - Implement audit logging
   - Create super-admin assisted reset interface

3. **Phase 3 - Advanced Features**:
   - Add multi-factor authentication
   - Implement security notifications
   - Create comprehensive session management
