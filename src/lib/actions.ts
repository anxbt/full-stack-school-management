"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  SchoolSchema,
  SchoolWithAdminSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

type CurrentState = { 
  success: boolean; 
  error: boolean;
  message?: string; 
};

// Cached schools query for better navigation UX
export const getSchoolsWithCache = unstable_cache(
  async (page: number, queryParams: Record<string, string | undefined>) => {
    const query: Prisma.SchoolWhereInput = {};
    const ITEM_PER_PAGE = 10;

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) {
          switch (key) {
            case "search":
              query.name = { contains: value, mode: "insensitive" };
              break;
            case "active":
              query.isActive = value === "true";
              break;
            default:
              break;
          }
        }
      }
    }

    return await prisma.$transaction([
      prisma.school.findMany({
        where: query,
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (page - 1),
        orderBy: {
          createdAt: "desc"
        },
        include: {
          _count: {
            select: {
              students: true,
              teachers: true,
              admins: true
            }
          }
        }
      }),
      prisma.school.count({ where: query }),
    ]);
  },
  ['schools-list'], // Cache key
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ['schools'], // For manual cache invalidation
  }
);

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    // For now, use a default school ID or get from session
    // You'll need to implement proper school context later
    let schoolId = data.schoolId || "school-1"; // Default to first school for testing
    
    // If no schoolId provided, try to get the first available school
    if (!data.schoolId) {
      const firstSchool = await prisma.school.findFirst({
        select: { id: true }
      });
      if (firstSchool) {
        schoolId = firstSchool.id;
      }
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"teacher"}
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        schoolId: schoolId,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating teacher:", err);

    // Handle Clerk-specific errors first
    if (err && typeof err === 'object' && 'errors' in err) {
      const clerkError = err as { errors: Array<{ code: string; message?: string; longMessage?: string }> };
      console.error("Clerk API Error Details:", clerkError.errors);

      const errorCode = clerkError.errors?.[0]?.code;
      const errorMessage = clerkError.errors?.[0]?.message || clerkError.errors?.[0]?.longMessage;

      if (errorCode === "form_identifier_exists") {
        return { success: false, error: true, message: "Username already exists" };
      } else if (errorCode === "form_password_pwned") {
        return { success: false, error: true, message: "Password is too common. Please use a more secure password." };
      } else if (errorCode === "form_password_length_too_short") {
        return { success: false, error: true, message: "Password must be at least 8 characters long" };
      } else if (errorCode === "form_username_invalid") {
        return { success: false, error: true, message: "Username contains invalid characters" };
      } else {
        return { success: false, error: true, message: `Clerk Error: ${errorMessage || 'Invalid user data'}` };
      }
    }

    return { success: false, error: true, message: "Failed to create teacher. Please try again." };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"student"}
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating student:", err);

    // Handle Clerk-specific errors first
    if (err && typeof err === 'object' && 'errors' in err) {
      const clerkError = err as { errors: Array<{ code: string; message?: string; longMessage?: string }> };
      console.error("Clerk API Error Details:", clerkError.errors);

      const errorCode = clerkError.errors?.[0]?.code;
      const errorMessage = clerkError.errors?.[0]?.message || clerkError.errors?.[0]?.longMessage;

      if (errorCode === "form_identifier_exists") {
        return { success: false, error: true, message: "Username already exists" };
      } else if (errorCode === "form_password_pwned") {
        return { success: false, error: true, message: "Password is too common. Please use a more secure password." };
      } else if (errorCode === "form_password_length_too_short") {
        return { success: false, error: true, message: "Password must be at least 8 characters long" };
      } else if (errorCode === "form_username_invalid") {
        return { success: false, error: true, message: "Username contains invalid characters" };
      } else {
        return { success: false, error: true, message: `Clerk Error: ${errorMessage || 'Invalid user data'}` };
      }
    }

    return { success: false, error: true, message: "Failed to create student. Please try again." };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};



export const updateSchool = async (
  currentState: CurrentState,
  data: SchoolSchema
) => {
  try {
    console.log("Updating school with data:", data);
    
    await prisma.school.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        code: data.code || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        logo: data.logo || undefined,
        domain: data.domain || undefined,
      },
    });

    console.log("School updated successfully");
    revalidatePath("/super-admin/schools");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating school:", err);
    return { success: false, error: true };
  }
}

export const deleteSchool = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.school.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/super-admin/schools");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
}





export const createSchoolWithAdmin = async (
  currentState: CurrentState,
  data: SchoolWithAdminSchema
) => {
  try {
    console.log("Creating school with admin, data:", data);
  
    // Create Clerk user first
    const clerkUserData: any = {
      username: data.adminUsername,
      password: data.adminPassword,
      firstName: data.adminFirstName,
      lastName: data.adminLastName,
      publicMetadata: { role: "admin" }
    };

    // Only add email if it's provided and not empty
    if (data.adminEmail && data.adminEmail.trim() !== '') {
      clerkUserData.emailAddress = [data.adminEmail.trim()];
    }

    console.log("Clerk user data being sent:", {
      ...clerkUserData,
      password: "[HIDDEN]" // Don't log the actual password
    });

    const user = await clerkClient.users.createUser(clerkUserData);

    const adminData = {
      id: user.id,
      username: data.adminUsername,
      img: null, // Can be updated later
    };

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
    
    // Handle Clerk-specific errors first
    if (err && typeof err === 'object' && 'errors' in err) {
      const clerkError = err as { errors: Array<{ code: string; message?: string; longMessage?: string }> };
      console.error("Clerk API Error Details:", clerkError.errors);
      
      const errorCode = clerkError.errors?.[0]?.code;
      const errorMessage = clerkError.errors?.[0]?.message || clerkError.errors?.[0]?.longMessage;
      
      if (errorCode === "form_identifier_exists") {
        return { success: false, error: true, message: "Admin username already exists" };
      } else if (errorCode === "form_password_pwned") {
        return { success: false, error: true, message: "Password is too common. Please use a more secure password." };
      } else if (errorCode === "form_password_length_too_short") {
        return { success: false, error: true, message: "Password must be at least 8 characters long" };
      } else if (errorCode === "form_username_invalid") {
        return { success: false, error: true, message: "Username contains invalid characters" };
      } else {
        return { success: false, error: true, message: `Clerk Error: ${errorMessage || 'Invalid user data'}` };
      }
    }
    
    // Handle Prisma errors
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      if (prismaError.meta?.target?.includes('code')) {
        return { success: false, error: true, message: "School code already exists" };
      }
      if (prismaError.meta?.target?.includes('username')) {
        return { success: false, error: true, message: "Admin username already exists" };
      }
    }
    
    return { success: false, error: true, message: "Failed to create school and admin. Please try again." };
  }
};