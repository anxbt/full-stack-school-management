import prisma from "../prisma";
import { getCurrentUserSchoolId, getSuperAdminSchoolId } from "../auth/school-context";
import { SchoolAccessError } from "../types/auth";

/**
 * School service for handling school-related business logic
 */
export class SchoolService {
  /**
   * Get school ID for current user with SuperAdmin support
   * @param superAdminSelectedSchoolId - Optional school ID for SuperAdmin
   * @returns Promise<string> - School ID
   */
  static async getContextualSchoolId(superAdminSelectedSchoolId?: string): Promise<string> {
    try {
      // Try regular user first
      return await getCurrentUserSchoolId();
    } catch (error) {
      // If it's a SuperAdmin, use SuperAdmin logic
      if (error instanceof SchoolAccessError && error.message.includes("SuperAdmin")) {
        return await getSuperAdminSchoolId(superAdminSelectedSchoolId);
      }
      throw error;
    }
  }

  /**
   * Get school details by ID with access validation
   * @param schoolId - School ID
   * @returns Promise with school details
   */
  static async getSchoolById(schoolId: string) {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        logo: true,
        isActive: true
      }
    });

    if (!school) {
      throw new SchoolAccessError("School not found", schoolId);
    }

    return school;
  }

  /**
   * Get all active schools (for SuperAdmin use)
   * @returns Promise with array of schools
   */
  static async getActiveSchools() {
    return await prisma.school.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        logo: true
      },
      orderBy: { name: "asc" }
    });
  }

  /**
   * Validate school exists and is active
   * @param schoolId - School ID to validate
   * @returns Promise<boolean>
   */
  static async isSchoolActive(schoolId: string): Promise<boolean> {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { isActive: true }
    });

    return school?.isActive || false;
  }

  /**
   * Get school statistics
   * @param schoolId - School ID
   * @returns Promise with school statistics
   */
  static async getSchoolStats(schoolId: string) {
    const [
      studentCount,
      teacherCount,
      classCount,
      subjectCount
    ] = await Promise.all([
      prisma.student.count({ where: { schoolId } }),
      prisma.teacher.count({ where: { schoolId } }),
      prisma.class.count({ where: { schoolId } }),
      prisma.subject.count({ where: { schoolId } })
    ]);

    return {
      students: studentCount,
      teachers: teacherCount,
      classes: classCount,
      subjects: subjectCount
    };
  }
}