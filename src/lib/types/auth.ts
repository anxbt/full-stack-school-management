export type UserRole = "superadmin" | "admin" | "teacher" | "student" | "parent";

export interface AuthUser {
  id: string;
  role: UserRole;
  schoolId?: string;
  email?: string;
  username?: string;
}

export interface SchoolContext {
  schoolId: string;
  schoolName?: string;
  userRole: UserRole;
  hasMultipleSchools?: boolean;
}

export interface SuperAdminSchoolAccess {
  schoolId: string;
  schoolName: string;
  role: "superadmin";
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class SchoolAccessError extends Error {
  constructor(message: string, public schoolId?: string) {
    super(message);
    this.name = "SchoolAccessError";
  }
}