import prisma from "../prisma";
import { getCurrentUser, getCurrentUserId } from "./user-context";
import { SchoolContext, AuthError, SchoolAccessError, SuperAdminSchoolAccess } from "../types/auth";

/**
 * Get the school ID for the current user based on their role
 * @returns Promise<string> - The school ID the user belongs to
 * @throws AuthError if user is not authenticated
 * @throws SchoolAccessError if user is not associated with any school
 */
export async function getCurrentUserSchoolId(): Promise<string> {
  const user = await getCurrentUser();
  const userId = user.id;

  try {
    let schoolId: string | null = null;

    switch (user.role) {
      case "admin":
        const admin = await prisma.admin.findUnique({
          where: { id: userId },
          select: { schoolId: true }
        });
        schoolId = admin?.schoolId || null;
        break;

      case "teacher":
        const teacher = await prisma.teacher.findUnique({
          where: { id: userId },
          select: { schoolId: true }
        });
        schoolId = teacher?.schoolId || null;
        break;

      case "student":
        const student = await prisma.student.findUnique({
          where: { id: userId },
          select: { schoolId: true }
        });
        schoolId = student?.schoolId || null;
        break;

      case "parent":
        const parent = await prisma.parent.findUnique({
          where: { id: userId },
          select: { schoolId: true }
        });
        schoolId = parent?.schoolId || null;
        break;

      case "superadmin":
        throw new SchoolAccessError(
          "SuperAdmin needs to select a school. Use getSuperAdminSchoolId() instead.",
          undefined
        );

      default:
        throw new AuthError(`Unknown user role: ${user.role}`, "UNKNOWN_ROLE");
    }

    if (!schoolId) {
      throw new SchoolAccessError(
        `User with role ${user.role} is not associated with any school`,
        undefined
      );
    }

    return schoolId;
  } catch (error) {
    if (error instanceof SchoolAccessError || error instanceof AuthError) {
      throw error;
    }
    throw new SchoolAccessError("Failed to get user's school ID", undefined);
  }
}

/**
 * Get full school context for the current user
 * @returns Promise<SchoolContext>
 */
export async function getCurrentUserSchoolContext(): Promise<SchoolContext> {
  const user = await getCurrentUser();
  
  if (user.role === "superadmin") {
    const schools = await getSuperAdminSchools();
    return {
      schoolId: schools[0]?.schoolId || "",
      schoolName: schools[0]?.schoolName,
      userRole: user.role,
      hasMultipleSchools: schools.length > 1
    };
  }

  const schoolId = await getCurrentUserSchoolId();
  
  // Get school name
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { name: true }
  });

  return {
    schoolId,
    schoolName: school?.name,
    userRole: user.role,
    hasMultipleSchools: false
  };
}

/**
 * Get all schools a SuperAdmin has access to
 * @returns Promise<SuperAdminSchoolAccess[]>
 * @throws AuthError if user is not a SuperAdmin
 */
export async function getSuperAdminSchools(): Promise<SuperAdminSchoolAccess[]> {
  const user = await getCurrentUser();
  
  if (user.role !== "superadmin") {
    throw new AuthError("User is not a SuperAdmin", "INSUFFICIENT_PERMISSIONS");
  }

  const superAdmin = await prisma.superAdmin.findUnique({
    where: { id: user.id },
    include: {
      schools: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!superAdmin) {
    throw new SchoolAccessError("SuperAdmin record not found", undefined);
  }

  return superAdmin.schools.map(school => ({
    schoolId: school.id,
    schoolName: school.name,
    role: "superadmin" as const
  }));
}

/**
 * Get school ID for SuperAdmin with validation
 * @param selectedSchoolId - Optional school ID to validate
 * @returns Promise<string> - Valid school ID
 * @throws AuthError if user is not a SuperAdmin
 * @throws SchoolAccessError if school access is invalid
 */
export async function getSuperAdminSchoolId(selectedSchoolId?: string): Promise<string> {
  const user = await getCurrentUser();
  
  if (user.role !== "superadmin") {
    throw new AuthError("User is not a SuperAdmin", "INSUFFICIENT_PERMISSIONS");
  }

  const availableSchools = await getSuperAdminSchools();
  
  if (availableSchools.length === 0) {
    throw new SchoolAccessError("SuperAdmin has no associated schools", undefined);
  }

  // If school ID provided, verify SuperAdmin has access
  if (selectedSchoolId) {
    const hasAccess = availableSchools.some(school => school.schoolId === selectedSchoolId);
    if (!hasAccess) {
      throw new SchoolAccessError(
        "SuperAdmin doesn't have access to this school",
        selectedSchoolId
      );
    }
    return selectedSchoolId;
  }

  // Return first available school if none selected
  return availableSchools[0].schoolId;
}

/**
 * Verify user has access to a specific school
 * @param schoolId - School ID to verify access to
 * @returns Promise<boolean>
 */
export async function userHasSchoolAccess(schoolId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    
    if (user.role === "superadmin") {
      const schools = await getSuperAdminSchools();
      return schools.some(school => school.schoolId === schoolId);
    }
    
    const userSchoolId = await getCurrentUserSchoolId();
    return userSchoolId === schoolId;
  } catch {
    return false;
  }
}

/**
 * Require user to have access to a specific school
 * @param schoolId - School ID that user must have access to
 * @throws SchoolAccessError if user doesn't have access
 */
export async function requireSchoolAccess(schoolId: string): Promise<void> {
  const hasAccess = await userHasSchoolAccess(schoolId);
  
  if (!hasAccess) {
    throw new SchoolAccessError(
      "User doesn't have access to this school",
      schoolId
    );
  }
}