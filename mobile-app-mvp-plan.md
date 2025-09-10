# Mobile App MVP Launch Plan - Updated Strategy

## 📱 Overview
This document outlines the strategy for launching a mobile app MVP for the school management system, focusing on **Teachers** and **Parents** as primary users. **Updated approach: Start with read operations migration to API routes, then add mobile-specific write operations.**

---

## 🎯 Updated MVP Scope & Strategy

### **Phase 1: Read Operations Migration (Priority)**
- ✅ **All read operations** → Convert to API routes
- ✅ **Safe to implement** → No data modification risk
- ✅ **Immediate value** → Parents can access child's data
- ✅ **Foundation for mobile** → Standard REST APIs

### **Phase 2: Mobile Write Operations**
- ✅ **Teacher attendance** → Mobile-optimized interface
- ✅ **Progressive enhancement** → Build on solid API foundation

### **Primary Users:**
1. **Teachers** - View operations + mobile attendance marking
2. **Parents** - Read-only operations (view children's data)
3. **Admins** - Read operations for monitoring

---

## 🔄 Migration Strategy: Server Actions → API Routes

### **Current State Analysis:**
```typescript
// Current Server Actions (Web Only)
export const getStudents = async () => { ... }        // ❌ Web only
export const getTeacherTimetable = async () => { ... } // ❌ Web only
export const getAttendance = async () => { ... }       // ❌ Web only

// Target API Routes (Mobile + Web)
GET /api/students                    // ✅ Universal
GET /api/teacher/timetable          // ✅ Universal  
GET /api/attendance/{classId}       // ✅ Universal
```

### **Migration Priority Order:**
1. **Authentication APIs** (Foundation)
2. **Teacher read operations** (Timetable, classes, students)
3. **Parent read operations** (Children data, attendance)
4. **Shared read operations** (School info, announcements)
5. **Write operations** (Attendance marking, updates)

---

## 🚀 Why Mobile App Makes Sense

### **For Teachers:**
- ✅ **On-the-go attendance marking** - Can mark attendance from anywhere in school
- ✅ **Quick timetable access** - Check schedule during breaks
- ✅ **Mobile-first design** - Optimized for touch interactions
- ✅ **Offline capability** - Mark attendance even with poor connectivity

### **For Parents:**
- ✅ **Convenient access** - Check child's progress anytime
- ✅ **Push notifications** - Instant updates on attendance/announcements
- ✅ **Mobile-optimized** - Better UX than web on mobile devices

---

## 🏗️ Technical Architecture

### **Current State Analysis:**
- ✅ **Next.js with Server Actions** - Great for web, but not API-friendly
- ❌ **No REST/GraphQL endpoints** - Mobile apps need traditional APIs
- ✅ **Prisma ORM** - Can be reused for API endpoints
- ✅ **Clerk Authentication** - Can be extended for mobile

### **Recommended Approach:**
```
Mobile App (React Native/Flutter) 
    ↓ (HTTP/REST)
Next.js API Routes (/api/*)
    ↓
Prisma ORM
    ↓ 
PostgreSQL Database
```

---

## 🛠️ Required API Endpoints

### **Authentication Endpoints:**
```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### **Teacher Endpoints:**
```
# Timetable
GET /api/teacher/timetable
GET /api/teacher/timetable/today
GET /api/teacher/classes

# Attendance
GET /api/teacher/attendance/{classId}/{date}
POST /api/teacher/attendance/mark
PUT /api/teacher/attendance/update
GET /api/teacher/attendance/history

# Classes & Students
GET /api/teacher/classes/{classId}/students
GET /api/teacher/subjects
```

### **Parent Endpoints:**
```
# Children Information
GET /api/parent/children
GET /api/parent/children/{childId}/profile

# Attendance
GET /api/parent/children/{childId}/attendance
GET /api/parent/children/{childId}/attendance/summary

# Academic Information
GET /api/parent/children/{childId}/timetable
GET /api/parent/children/{childId}/results
GET /api/parent/children/{childId}/assignments

# Communication
GET /api/parent/announcements
GET /api/parent/events
```

### **Shared Endpoints:**
```
GET /api/school/info
GET /api/notifications
POST /api/notifications/mark-read
```

---

## � React Native Authentication Strategy

### **Authentication Flow Options:**

#### **Option 1: Clerk React Native SDK (Recommended)**
```bash
# Install Clerk React Native
npm install @clerk/clerk-expo
# or for bare React Native
npm install @clerk/clerk-react
```

**Pros:**
- ✅ **Seamless integration** with existing Clerk setup
- ✅ **Built-in biometric auth** support
- ✅ **Session management** handled automatically
- ✅ **Same user database** as web app

**Implementation:**
```typescript
// App.tsx
import { ClerkProvider } from '@clerk/clerk-expo';

export default function App() {
  return (
    <ClerkProvider publishableKey="pk_your_key">
      <NavigationContainer>
        {/* Your app */}
      </NavigationContainer>
    </ClerkProvider>
  );
}

// Login Screen
import { useSignIn } from '@clerk/clerk-expo';

export function LoginScreen() {
  const { signIn, setActive } = useSignIn();
  
  const handleLogin = async (username: string, password: string) => {
    try {
      const result = await signIn.create({
        identifier: username,
        password: password,
      });
      
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Navigate to main app
      }
    } catch (error) {
      // Handle error
    }
  };
}

// API calls with auth
import { useAuth } from '@clerk/clerk-expo';

export function useApiCall() {
  const { getToken } = useAuth();
  
  const apiCall = async (endpoint: string) => {
    const token = await getToken();
    return fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };
  
  return { apiCall };
}
```

#### **Option 2: Custom JWT Implementation (Alternative)**
```typescript
// For more control, but requires more setup
interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

// Custom auth hook
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    const { token, user } = await response.json();
    
    // Store in secure storage
    await SecureStore.setItemAsync('auth_token', token);
    setAuthState({ token, user, isLoading: false });
  };
  
  return { ...authState, login };
}
```

### **Secure Token Storage:**
```typescript
// Using Expo SecureStore
import * as SecureStore from 'expo-secure-store';

class TokenManager {
  static async saveToken(token: string) {
    await SecureStore.setItemAsync('auth_token', token);
  }
  
  static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('auth_token');
  }
  
  static async clearToken() {
    await SecureStore.deleteItemAsync('auth_token');
  }
}
```

### **API Authentication Middleware (Server Side):**
```typescript
// src/lib/auth-middleware.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function authenticateAPIRequest(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { error: 'No token provided', status: 401 };
    }

    // For Clerk tokens
    const { userId } = auth();
    if (!userId) {
      return { error: 'Invalid token', status: 401 };
    }

    // Get user details from database
    const user = await prisma.teacher.findUnique({ 
      where: { id: userId } 
    }) || await prisma.parent.findUnique({ 
      where: { id: userId } 
    });

    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    return { user, userId, error: null };
  } catch (error) {
    return { error: 'Authentication failed', status: 401 };
  }
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const auth = await authenticateAPIRequest(request);
  
  if (auth.error) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  // Continue with authenticated request
  const { user, userId } = auth;
  // ... rest of API logic
}
```

#### **Step 1: Set up API Route Structure**
```typescript
// File structure
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── refresh/route.ts
│   └── me/route.ts
├── teacher/
│   ├── timetable/route.ts
│   ├── classes/route.ts
│   └── attendance/
│       ├── [classId]/[date]/route.ts
│       └── mark/route.ts
├── parent/
│   ├── children/route.ts
│   └── children/[childId]/
│       ├── attendance/route.ts
│       ├── timetable/route.ts
│       └── results/route.ts
└── shared/
    ├── school/route.ts
    └── notifications/route.ts
```

#### **Step 2: Authentication Strategy**
```typescript
// Using Clerk with JWT tokens for mobile
// Alternative: Custom JWT implementation
import { clerkClient } from '@clerk/nextjs/server';

export async function authenticateRequest(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  // Verify JWT token and return user info
}
```

#### **Step 3: API Response Standardization**
```typescript
// Standard API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}
```

### **Phase 2: Mobile App Development (4-6 weeks)**

#### **Technology Choice:**
- **React Native** (Recommended) - Code reuse with existing React knowledge
- **Flutter** (Alternative) - Better performance, but new learning curve

#### **Core Screens:**
```
Teachers:
├── Login
├── Dashboard
├── Timetable
├── Class List
├── Attendance Marking
└── Attendance History

Parents:
├── Login
├── Dashboard
├── Children List
├── Child Profile
├── Attendance View
├── Timetable View
└── Announcements
```

---

## 📋 Read Operations Migration Plan

### **Priority 1: Teacher Read APIs**
```typescript
// 1. Teacher Timetable API
// src/app/api/teacher/timetable/route.ts
export async function GET(request: NextRequest) {
  const auth = await authenticateAPIRequest(request);
  if (auth.error) return errorResponse(auth);

  const lessons = await prisma.lesson.findMany({
    where: { 
      teacherId: auth.userId,
      // Add school filtering when ready
    },
    include: {
      subject: true,
      class: true,
    },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  });

  return NextResponse.json({
    success: true,
    data: { lessons },
    timestamp: new Date().toISOString(),
  });
}

// 2. Teacher Classes API
// src/app/api/teacher/classes/route.ts
export async function GET(request: NextRequest) {
  const auth = await authenticateAPIRequest(request);
  if (auth.error) return errorResponse(auth);

  const classes = await prisma.class.findMany({
    where: { 
      lessons: {
        some: { teacherId: auth.userId }
      }
    },
    include: {
      grade: true,
      _count: { select: { students: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: { classes },
  });
}

// 3. Class Students API
// src/app/api/teacher/classes/[classId]/students/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  const auth = await authenticateAPIRequest(request);
  if (auth.error) return errorResponse(auth);

  const students = await prisma.student.findMany({
    where: { classId: parseInt(params.classId) },
    select: {
      id: true,
      name: true,
      surname: true,
      img: true,
      // Don't expose sensitive data
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    success: true,
    data: { students },
  });
}
```

### **Priority 2: Parent Read APIs**
```typescript
// 1. Parent Children API
// src/app/api/parent/children/route.ts
export async function GET(request: NextRequest) {
  const auth = await authenticateAPIRequest(request);
  if (auth.error) return errorResponse(auth);

  const children = await prisma.student.findMany({
    where: { parentId: auth.userId },
    include: {
      class: {
        include: { grade: true }
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: { children },
  });
}

// 2. Child Attendance API
// src/app/api/parent/children/[childId]/attendance/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  const auth = await authenticateAPIRequest(request);
  if (auth.error) return errorResponse(auth);

  // Verify parent owns this child
  const child = await prisma.student.findFirst({
    where: { 
      id: params.childId,
      parentId: auth.userId 
    },
  });

  if (!child) {
    return NextResponse.json(
      { success: false, error: 'Child not found' },
      { status: 404 }
    );
  }

  const attendance = await prisma.attendance.findMany({
    where: { studentId: params.childId },
    include: { lesson: { include: { subject: true } } },
    orderBy: { date: 'desc' },
    take: 30, // Last 30 records
  });

  const summary = {
    totalDays: attendance.length,
    presentDays: attendance.filter(a => a.present).length,
    absentDays: attendance.filter(a => !a.present).length,
  };

  return NextResponse.json({
    success: true,
    data: { 
      child: {
        id: child.id,
        name: child.name,
        surname: child.surname,
      },
      attendance,
      summary: {
        ...summary,
        attendancePercentage: summary.totalDays > 0 
          ? (summary.presentDays / summary.totalDays * 100).toFixed(1)
          : '0'
      }
    },
  });
}
```

### **Priority 3: Shared Read APIs**
```typescript
// 1. School Information API
// src/app/api/school/info/route.ts
export async function GET(request: NextRequest) {
  const auth = await authenticateAPIRequest(request);
  if (auth.error) return errorResponse(auth);

  // Get user's school (will need to add schoolId to user models)
  const school = await prisma.school.findFirst({
    // Will need to determine school based on user
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      email: true,
      logo: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: { school },
  });
}

// 2. Announcements API
// src/app/api/announcements/route.ts
export async function GET(request: NextRequest) {
  const auth = await authenticateAPIRequest(request);
  if (auth.error) return errorResponse(auth);

  const announcements = await prisma.announcement.findMany({
    // Filter by user's school
    orderBy: { date: 'desc' },
    take: 20,
  });

  return NextResponse.json({
    success: true,
    data: { announcements },
  });
}
```

---

## 🔄 Migration from Server Actions to API Routes

### **Current Server Action Example:**
```typescript
// src/lib/actions.ts (Current)
export const markAttendance = async (data: AttendanceData) => {
  // Server action implementation
};
```

### **Converted to API Route:**
```typescript
// src/app/api/teacher/attendance/mark/route.ts (New)
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mark attendance
    const result = await prisma.attendance.createMany({
      data: body.attendanceRecords.map((record: any) => ({
        ...record,
        teacherId: user.id,
        date: new Date(body.date),
      })),
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Attendance marked successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to mark attendance',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

---

## 📊 Database Considerations

### **New Tables/Fields Needed:**
```sql
-- Push notification tokens
CREATE TABLE push_tokens (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  token VARCHAR NOT NULL,
  platform VARCHAR NOT NULL, -- 'ios' or 'android'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API rate limiting
CREATE TABLE api_rate_limits (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  endpoint VARCHAR NOT NULL,
  requests_count INTEGER DEFAULT 0,
  window_start TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Optimizations for Mobile:**
```typescript
// Add indexes for mobile queries
// Teacher timetable queries
CREATE INDEX idx_lessons_teacher_day ON lessons(teacherId, day);

// Parent child queries  
CREATE INDEX idx_students_parent ON students(parentId);
CREATE INDEX idx_attendance_student_date ON attendance(studentId, date);
```

---

## �️ Updated Implementation Roadmap

### **Phase 1: Read Operations API Migration (2 weeks)**

#### **Week 1: Core Infrastructure**
- [ ] Set up API route structure (`/src/app/api/`)
- [ ] Create authentication middleware
- [ ] Implement standard response format helper
- [ ] Build and test teacher timetable API
- [ ] Build and test teacher classes API

#### **Week 2: Parent & Shared APIs**
- [ ] Build parent children API
- [ ] Build child attendance API
- [ ] Create school info API
- [ ] Add announcements API
- [ ] API testing and documentation

### **Phase 2: React Native App Foundation (2 weeks)**

#### **Week 3: App Setup & Auth**
- [ ] Initialize React Native/Expo project
- [ ] Set up Clerk React Native integration
- [ ] Create login/authentication flow
- [ ] Build secure token storage
- [ ] Test authentication with APIs

#### **Week 4: Read Operations UI**
- [ ] Teacher timetable screen
- [ ] Parent children list screen
- [ ] Child attendance detail screen
- [ ] Basic navigation and UI polish
- [ ] API integration and error handling

### **Phase 3: Write Operations (2 weeks)**

#### **Week 5: Attendance Marking API**
- [ ] Build attendance marking endpoint
- [ ] Add attendance history API
- [ ] Implement optimistic updates
- [ ] Add offline support planning

#### **Week 6: Mobile Attendance UI**
- [ ] Teacher attendance marking screen
- [ ] Offline attendance storage
- [ ] Sync functionality
- [ ] Testing on actual devices

### **Phase 4: Testing & Launch (1 week)**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] App store preparation
- [ ] Beta testing with teachers/parents

---

## 📱 React Native Project Structure

```
mobile-app/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── teacher/
│   │   └── parent/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── AuthLoadingScreen.tsx
│   │   ├── teacher/
│   │   │   ├── TimetableScreen.tsx
│   │   │   ├── AttendanceScreen.tsx
│   │   │   └── ClassListScreen.tsx
│   │   └── parent/
│   │       ├── ChildrenListScreen.tsx
│   │       ├── ChildDetailScreen.tsx
│   │       └── AttendanceViewScreen.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── storage.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useOfflineSync.ts
│   ├── types/
│   │   └── api.ts
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
├── App.tsx
└── package.json
```

## 🔄 API Service Layer (React Native)

```typescript
// src/services/api.ts
import { useAuth } from '@clerk/clerk-expo';

class ApiService {
  private baseUrl = 'https://yourapp.com/api';
  
  constructor(private getToken: () => Promise<string | null>) {}

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Teacher APIs
  async getTeacherTimetable() {
    return this.request<{ lessons: Lesson[] }>('/teacher/timetable');
  }

  async getTeacherClasses() {
    return this.request<{ classes: Class[] }>('/teacher/classes');
  }

  async getClassStudents(classId: string) {
    return this.request<{ students: Student[] }>(`/teacher/classes/${classId}/students`);
  }

  // Parent APIs
  async getParentChildren() {
    return this.request<{ children: Student[] }>('/parent/children');
  }

  async getChildAttendance(childId: string) {
    return this.request<ChildAttendanceData>(`/parent/children/${childId}/attendance`);
  }

  // Shared APIs
  async getSchoolInfo() {
    return this.request<{ school: School }>('/school/info');
  }

  async getAnnouncements() {
    return this.request<{ announcements: Announcement[] }>('/announcements');
  }
}

// Hook for using API service
export function useApiService() {
  const { getToken } = useAuth();
  return new ApiService(getToken);
}
```

## 🎯 Testing Strategy for Read Operations

### **API Testing:**
```typescript
// Example API test
describe('Teacher Timetable API', () => {
  it('should return teacher lessons', async () => {
    const mockTeacher = await createMockTeacher();
    const token = await generateTestToken(mockTeacher);

    const response = await fetch('/api/teacher/timetable', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.lessons).toBeArray();
  });

  it('should require authentication', async () => {
    const response = await fetch('/api/teacher/timetable');
    expect(response.status).toBe(401);
  });
});
```

### **Mobile App Testing:**
```typescript
// Example React Native test
import { render, waitFor } from '@testing-library/react-native';
import TimetableScreen from '../screens/teacher/TimetableScreen';

describe('TimetableScreen', () => {
  it('should display teacher lessons', async () => {
    const mockApiService = {
      getTeacherTimetable: jest.fn().mockResolvedValue({
        success: true,
        data: { lessons: mockLessons },
      }),
    };

    const { getByText } = render(
      <TimetableScreen apiService={mockApiService} />
    );

    await waitFor(() => {
      expect(getByText('Math - Grade 5A')).toBeTruthy();
    });
  });
});
```

---

## 🔐 Security Considerations

### **API Security:**
- ✅ **JWT Authentication** with short expiry times
- ✅ **Rate Limiting** to prevent abuse
- ✅ **Input Validation** for all endpoints
- ✅ **CORS Configuration** for mobile apps
- ✅ **Role-based Access Control**

### **Mobile Security:**
- ✅ **Secure Token Storage** (KeyChain/KeyStore)
- ✅ **Certificate Pinning** for API calls
- ✅ **Biometric Authentication** (optional)
- ✅ **App State Security** (hide sensitive data when backgrounded)

---

## ⚡ Quick Start: First API Implementation

Let's start with the **Teacher Timetable API** as our first read operation migration:

### **Step 1: Create the API Route**
```bash
# Create the directory structure
mkdir -p src/app/api/teacher/timetable
touch src/app/api/teacher/timetable/route.ts
```

### **Step 2: Create Authentication Helper**
```bash
# Create auth utility
touch src/lib/api-auth.ts
```

### **Step 3: Implement Basic API**
```typescript
// src/lib/api-auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from './prisma';

export async function authenticateAPIRequest(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Check if user is a teacher
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true }
    });

    if (teacher) {
      return { user: teacher, userId, role: 'teacher', error: null };
    }

    // Check if user is a parent  
    const parent = await prisma.parent.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true }
    });

    if (parent) {
      return { user: parent, userId, role: 'parent', error: null };
    }

    return { error: 'User not found', status: 404 };
  } catch (error) {
    console.error('Auth error:', error);
    return { error: 'Authentication failed', status: 401 };
  }
}

export function apiResponse<T>(data: T, success = true) {
  return NextResponse.json({
    success,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function apiError(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
```

### **Step 4: First API Route Implementation**
```typescript
// src/app/api/teacher/timetable/route.ts
import { NextRequest } from 'next/server';
import { authenticateAPIRequest, apiResponse, apiError } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await authenticateAPIRequest(request);
  
  if (auth.error) {
    return apiError(auth.error, auth.status);
  }

  if (auth.role !== 'teacher') {
    return apiError('Access denied', 403);
  }

  try {
    const lessons = await prisma.lesson.findMany({
      where: { teacherId: auth.userId },
      include: {
        subject: {
          select: { name: true }
        },
        class: {
          select: { name: true, capacity: true },
          include: {
            grade: { select: { level: true } }
          }
        }
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ],
    });

    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      name: lesson.name,
      subject: lesson.subject.name,
      class: lesson.class.name,
      grade: lesson.class.grade.level,
      day: lesson.day,
      startTime: lesson.startTime.toISOString(),
      endTime: lesson.endTime.toISOString(),
    }));

    return apiResponse({ lessons: formattedLessons });
  } catch (error) {
    console.error('Timetable API error:', error);
    return apiError('Failed to fetch timetable', 500);
  }
}
```

### **Step 5: Test the API**
```bash
# Test with curl (replace with actual auth token)
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/teacher/timetable
```

### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "lessons": [
      {
        "id": "lesson-1",
        "name": "Mathematics for 5A",
        "subject": "Mathematics",
        "class": "5A",
        "grade": 5,
        "day": "MONDAY",
        "startTime": "2024-01-01T09:00:00.000Z",
        "endTime": "2024-01-01T10:00:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🎯 Next Steps Summary

### **Immediate Actions:**
1. **✅ Implement teacher timetable API** (above example)
2. **✅ Test with Postman/curl** to ensure it works
3. **✅ Create parent children API** (similar pattern)
4. **✅ Set up basic React Native project** with Clerk auth

### **This Week's Goals:**
- [ ] Get teacher timetable API working
- [ ] Add parent children list API  
- [ ] Test APIs with existing web app users
- [ ] Document API endpoints for mobile team

### **Benefits of This Approach:**
- ✅ **Safe to test** - Read operations don't modify data
- ✅ **Immediate value** - APIs work for web AND mobile
- ✅ **Progressive** - Build confidence before write operations
- ✅ **Reusable** - Same APIs for current web app improvements

---

*This updated plan focuses on practical implementation steps, starting with safe read operations and building toward a robust mobile app foundation.*
