import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { UserRole, AuthUser, AuthError } from "../types/auth";

/**
 * Get the current authenticated user from Clerk
 * @returns AuthUser object with id, role, and basic info
 * @throws AuthError if user is not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      throw new AuthError("User not authenticated", "UNAUTHENTICATED");
    }

    const user = await currentUser();
    
    if (!user) {
      throw new AuthError("User not found", "USER_NOT_FOUND");
    }

    const role = user.publicMetadata?.role as UserRole;
    
    if (!role) {
      throw new AuthError("User role not found in metadata", "ROLE_NOT_FOUND");
    }

    return {
      id: userId,
      role,
      email: user.emailAddresses[0]?.emailAddress,
      username: user.username || undefined,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Failed to get current user", "CLERK_ERROR");
  }
}

/**
 * Get the current user's ID only (lighter than getCurrentUser)
 * @returns User ID string
 * @throws AuthError if user is not authenticated
 */
export function getCurrentUserId(): string {
  const { userId } = auth();
  
  if (!userId) {
    throw new AuthError("User not authenticated", "UNAUTHENTICATED");
  }

  return userId;
}

/**
 * Check if user has a specific role
 * @param requiredRole - Role to check against
 * @returns boolean
 */
export async function userHasRole(requiredRole: UserRole): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user.role === requiredRole;
  } catch {
    return false;
  }
}

/**
 * Check if user has any of the specified roles
 * @param allowedRoles - Array of roles to check against
 * @returns boolean
 */
export async function userHasAnyRole(allowedRoles: UserRole[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return allowedRoles.includes(user.role);
  } catch {
    return false;
  }
}

/**
 * Require user to have specific role, throw error if not
 * @param requiredRole - Role that user must have
 * @throws AuthError if user doesn't have required role
 */
export async function requireRole(requiredRole: UserRole): Promise<void> {
  const user = await getCurrentUser();
  
  if (user.role !== requiredRole) {
    throw new AuthError(
      `Access denied. Required role: ${requiredRole}, current role: ${user.role}`,
      "INSUFFICIENT_PERMISSIONS"
    );
  }
}

/**
 * Require user to have any of the specified roles
 * @param allowedRoles - Array of roles user can have
 * @throws AuthError if user doesn't have any of the required roles
 */
export async function requireAnyRole(allowedRoles: UserRole[]): Promise<void> {
  const user = await getCurrentUser();
  
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError(
      `Access denied. Required roles: ${allowedRoles.join(", ")}, current role: ${user.role}`,
      "INSUFFICIENT_PERMISSIONS"
    );
  }
}