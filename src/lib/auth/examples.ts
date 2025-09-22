/**
 * Usage Examples for the New Auth System
 * 
 * This file demonstrates how to use the new authentication and school context system
 * in your application server actions and API routes.
 */

import {
  getCurrentUser,
  getCurrentUserSchoolId,
  getCurrentUserSchoolContext,
  getSuperAdminSchools,
  getSuperAdminSchoolId,
  requireRole,
  requireAnyRole,
  userHasSchoolAccess,
  requireSchoolAccess,
  SchoolService,
  AuthError,
  SchoolAccessError
} from "./index";

// =====================================================
// 1. BASIC USER AUTHENTICATION
// =====================================================

/**
 * Example: Get current user information
 */
export async function getCurrentUserInfo() {
  try {
    const user = await getCurrentUser();
    
    return {
      success: true,
      data: {
        id: user.id,
        role: user.role,
        email: user.email
      }
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Please log in to continue" };
    }
    return { success: false, error: "Error loading user info" };
  }
}

// =====================================================
// 2. SCHOOL CONTEXT USAGE
// =====================================================

/**
 * Example: Get school context for current user
 */
export async function getSchoolContext() {
  try {
    const schoolContext = await getCurrentUserSchoolContext();
    
    return {
      success: true,
      data: {
        schoolName: schoolContext.schoolName,
        userRole: schoolContext.userRole,
        hasMultipleSchools: schoolContext.hasMultipleSchools
      }
    };
  } catch (error) {
    if (error instanceof SchoolAccessError) {
      return { success: false, error: "No school access found" };
    }
    return { success: false, error: "Error loading school info" };
  }
}

// =====================================================
// 3. SERVER ACTION EXAMPLES
// =====================================================

/**
 * Example: Server action with automatic school context
 */
export async function createStudentWithContext(studentData: any) {
  try {
    // Automatically gets the school ID for the current user
    const schoolId = await getCurrentUserSchoolId();
    
    // Your logic here - example
    console.log(`Creating student in school: ${schoolId}`);
    
    return { success: true, schoolId };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Authentication required" };
    }
    if (error instanceof SchoolAccessError) {
      return { success: false, error: "No school access" };
    }
    return { success: false, error: "Unknown error" };
  }
}

/**
 * Example: Server action for SuperAdmin with school selection
 */
export async function createStudentAsSuperAdmin(
  studentData: any,
  selectedSchoolId?: string
) {
  try {
    // SuperAdmin can select which school to create student in
    const schoolId = await getSuperAdminSchoolId(selectedSchoolId);
    
    // Your logic here
    console.log(`SuperAdmin creating student in school: ${schoolId}`);
    
    return { success: true, schoolId };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "SuperAdmin access required" };
    }
    if (error instanceof SchoolAccessError) {
      return { success: false, error: "Invalid school selection" };
    }
    return { success: false, error: "Unknown error" };
  }
}

// =====================================================
// 4. ROLE-BASED ACCESS CONTROL
// =====================================================

/**
 * Example: Admin-only function
 */
export async function adminOnlyFunction() {
  try {
    await requireRole("admin");
    
    // This code only runs if user is an admin
    console.log("Admin function executed");
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Admin access required" };
    }
    return { success: false, error: "Unknown error" };
  }
}

/**
 * Example: Teacher or Admin function
 */
export async function teacherOrAdminFunction() {
  try {
    await requireAnyRole(["teacher", "admin"]);
    
    // This code runs if user is either teacher or admin
    console.log("Teacher/Admin function executed");
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Teacher or Admin access required" };
    }
    return { success: false, error: "Unknown error" };
  }
}

// =====================================================
// 5. SUPERADMIN SCHOOL MANAGEMENT
// =====================================================

/**
 * Example: SuperAdmin school selector options
 */
export async function getSuperAdminSchoolOptions() {
  try {
    const schools = await getSuperAdminSchools();
    
    return {
      success: true,
      data: schools.map(school => ({
        value: school.schoolId,
        label: school.schoolName
      }))
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "SuperAdmin access required" };
    }
    return { success: false, error: "Error loading schools" };
  }
}

// =====================================================
// 6. SCHOOL SERVICE USAGE
// =====================================================

/**
 * Example: Using SchoolService for complex operations
 */
export async function getSchoolDashboardData(superAdminSelectedSchoolId?: string) {
  try {
    // Automatically handles both regular users and SuperAdmins
    const schoolId = await SchoolService.getContextualSchoolId(superAdminSelectedSchoolId);
    
    // Get school details and stats
    const [schoolDetails, schoolStats] = await Promise.all([
      SchoolService.getSchoolById(schoolId),
      SchoolService.getSchoolStats(schoolId)
    ]);
    
    return {
      success: true,
      data: {
        school: schoolDetails,
        stats: schoolStats
      }
    };
  } catch (error) {
    if (error instanceof AuthError || error instanceof SchoolAccessError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to load dashboard data" };
  }
}

// =====================================================
// 7. ACCESS VALIDATION EXAMPLES
// =====================================================

/**
 * Example: Validate access to specific school data
 */
export async function accessSpecificSchoolData(schoolId: string) {
  try {
    // Ensure user has access to this school
    await requireSchoolAccess(schoolId);
    
    // Safe to access school data
    const schoolData = await SchoolService.getSchoolById(schoolId);
    
    return { success: true, data: schoolData };
  } catch (error) {
    if (error instanceof SchoolAccessError) {
      return { success: false, error: "Access denied to this school" };
    }
    return { success: false, error: "Unknown error" };
  }
}

// =====================================================
// 8. ERROR HANDLING PATTERNS
// =====================================================

/**
 * Example: Comprehensive error handling
 */
export async function robustFunction() {
  try {
    const user = await getCurrentUser();
    const schoolId = await getCurrentUserSchoolId();
    
    // Your business logic here
    
    return { success: true, data: { user, schoolId } };
  } catch (error) {
    console.error("Error in robustFunction:", error);
    
    if (error instanceof AuthError) {
      switch (error.code) {
        case "UNAUTHENTICATED":
          return { success: false, error: "Please log in" };
        case "INSUFFICIENT_PERMISSIONS":
          return { success: false, error: "Access denied" };
        default:
          return { success: false, error: "Authentication error" };
      }
    }
    
    if (error instanceof SchoolAccessError) {
      return { success: false, error: "School access error" };
    }
    
    return { success: false, error: "Unknown error occurred" };
  }
}