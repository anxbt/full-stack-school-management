"use client"
import React, { useState, useEffect } from 'react';
import AttendanceClassSelector from '@/components/attendance/AttendanceClassSelector';
// import AttendanceSheet from '@/components/attendance/AttendanceSheet';
import AttendanceSheet from '@/components/attendance/AttendanceSheet'
import AttendanceHistory from '@/components/attendance/AttendanceHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getClassesForTeacherAttendance,
  getStudentsForAttendance,
  saveAttendance
} from '@/lib/actions';
import { useAuth } from '@clerk/nextjs';
// Demo data
const demoClasses = [
  { id: 1, name: 'Class 1-A', studentCount: 25, attendanceStatus: 'not-taken' as const },
  { id: 2, name: 'Class 2-B', studentCount: 28, attendanceStatus: 'taken' as const },
  { id: 3, name: 'Class 3-C', studentCount: 22, attendanceStatus: 'not-taken' as const },
];

const demoStudents = [
  { id: 's1', name: 'John', surname: 'Doe', img: null },
  { id: 's2', name: 'Jane', surname: 'Smith', img: null },
  { id: 's3', name: 'Alice', surname: 'Johnson', img: null },
  { id: 's4', name: 'Bob', surname: 'Brown', img: null },
  { id: 's5', name: 'Charlie', surname: 'Davis', img: null },
];

const demoAttendanceRecords = [
  {
    id: 1,
    date: '2025-09-13T00:00:00.000Z',
    student: { id: 's1', name: 'John', surname: 'Doe', img: null },
    present: true
  },
  {
    id: 2,
    date: '2025-09-13T00:00:00.000Z',
    student: { id: 's2', name: 'Jane', surname: 'Smith', img: null },
    present: false,
    updatedBy: 'Mr. Anderson',
    updatedAt: '2025-09-13T10:30:00.000Z'
  },
  {
    id: 3,
    date: '2025-09-12T00:00:00.000Z',
    student: { id: 's1', name: 'John', surname: 'Doe', img: null },
    present: true
  },
  {
    id: 4,
    date: '2025-09-12T00:00:00.000Z',
    student: { id: 's2', name: 'Jane', surname: 'Smith', img: null },
    present: true
  },
];

export default function AttendancePage() {
  const [view, setView] = useState<'classes' | 'take' | 'history'>('classes');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [fetchedClasses, setFetchedClasses] = useState<any[]>([]);
  const [fetchedStudents, setFecthedStudents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchClasses() {
      if (!userId) return;
      const classesResult = await getClassesForTeacherAttendance(userId);

      if (classesResult.success && classesResult.data) {
        const mappedClasses = classesResult.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          studentCount: c._count?.students ?? 0,
          attendanceStatus: c.attendanceStatus ? 'taken' : 'not-taken'
        }));

        setFetchedClasses(mappedClasses);
      } else {
        setError(classesResult.message || 'Failed to fetch classes');
      }
    }
    fetchClasses();
  }, [userId])


  useEffect(() => {
    async function fetchStudents() {
      if (!selectedClassId) return;

      const studentsResult = await getStudentsForAttendance(selectedClassId, new Date());
      if (studentsResult.success && studentsResult.data) {
        // Map the server response to match AttendanceSheet's expected Student type
        const mappedStudents = studentsResult.data.map((student: any) => ({
          id: student.studentId, // Map studentId to id
          name: student.name,
          surname: student.surname,
          img: student.img,
          currentAttendance: student.currentAttendance
        }));

        setFecthedStudents(mappedStudents);
        console.log("fetched students are", mappedStudents);
      } else {
        setError(studentsResult.message || 'Failed to fetch students');
      }
    }
    fetchStudents();
  }, [selectedClassId]);

  const handleSelectClass = (classId: number) => {
    setSelectedClassId(classId);
    setView('take'); // Default to take attendance view
  }



  // const handleSaveAttendance = (attendanceData: { studentId: string; present: boolean }[]) => {
  //   setIsLoading(true);

  //   // Simulate API call
  //   console.log('Saving attendance data:', attendanceData);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     setView('classes');
  //     // Show a real toast notification here instead of alert
  //     alert('Attendance saved successfully!');
  //   }, 1000);
  // };


  // const handleSaveAttendance = async (classId: ,
  //   new Date(),
  //   teacherId,
  //   schoolId,
  //   attendanceRecords)=>{

  //   }


  const handleEditRecord = (recordId: number, present: boolean) => {
    setIsLoading(true);

    // Simulate API call
    console.log('Updating attendance record:', { recordId, present });
    setTimeout(() => {
      setIsLoading(false);
      // Show a real toast notification here instead of alert
      alert('Attendance record updated successfully!');
    }, 1000);
  };


  const handleSaveAttendance = async (attendanceData: { studentId: string; present: boolean }[]) => {
   
    }
  
  const selectedClass = fetchedClasses.find(c => c.id === selectedClassId);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <span className="material-icons-outlined">assignment_turned_in</span>
          Attendance Management
        </h1>
        <p className="text-gray-600 ml-8">Keep track of student attendance records</p>
      </div>

      {view !== 'classes' && (
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setView('classes')}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <span className="material-icons-outlined text-sm">arrow_back</span>
            Back to Classes
          </Button>

          {selectedClass && (
            <>
              <Button
                variant={view === 'take' ? 'default' : 'outline'}
                onClick={() => setView('take')}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <span className="material-icons-outlined text-sm">edit</span>
                Take Attendance
              </Button>
              <Button
                variant={view === 'history' ? 'default' : 'outline'}
                onClick={() => setView('history')}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <span className="material-icons-outlined text-sm">history</span>
                View History
              </Button>
            </>
          )}
        </div>
      )}

      {view === 'classes' && (
        <AttendanceClassSelector
          classes={fetchedClasses} // Replace with fetchedClasses to use real data
          onSelectClass={handleSelectClass}
          isLoading={isLoading}
        />
      )}

      {view === 'take' && selectedClass && (
        <AttendanceSheet
          students={fetchedStudents}
          date={new Date()}
          className={selectedClass.name}
          onSave={handleSaveAttendance}
          isLoading={isLoading}
        />
      )}

      {view === 'history' && selectedClass && (
        <AttendanceHistory
          records={demoAttendanceRecords}
          className={selectedClass.name}
          onEditRecord={handleEditRecord}
          isLoading={isLoading}
        />
      )}

      {/* Add this link to Material Icons in the Head component or in your layout */}
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}