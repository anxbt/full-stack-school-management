import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const { userId, sessionClaims } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    // Role-based access control (same as your web app)
    if (!['admin', 'teacher'].includes(role!)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const classId = searchParams.get('classId');

    const p = Math.max(1, page);

    // Build query (EXACT same logic as your teachers/page.tsx)
    const query: any = {};

    if (search) {
      query.name = { contains: search, mode: 'insensitive' };
    }

    if (classId) {
      query.lessons = {
        some: {
          classId: parseInt(classId),
        },
      };
    }

    // Execute query (SAME as your web app)
    const [data, count] = await prisma.$transaction([
      prisma.teacher.findMany({
        where: query,
        include: {
          subjects: true,
          classes: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.teacher.count({ where: query }),
    ]);

    return NextResponse.json({
      success: true,
      data: data,
      pagination: {
        page: p,
        totalPages: Math.ceil(count / ITEM_PER_PAGE),
        totalCount: count,
        hasNext: p * ITEM_PER_PAGE < count,
        hasPrev: p > 1,
      },
      meta: {
        role: role,
        userId: userId,
      }
    });

  } catch (error) {
    console.error('Teachers API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
