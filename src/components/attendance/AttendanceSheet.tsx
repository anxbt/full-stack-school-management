import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Student = {
  id: string;
  name: string;
  surname: string;
  img: string | null;
  currentAttendance?: {
    attendanceId?: number;
    present?: boolean;
  };
};

type AttendanceSheetProps = {
  students: Student[];
  date: Date;
  className: string;
  onSave: (attendanceData: { studentId: string; present: boolean }[]) => void;
  isLoading?: boolean;
};

export default function AttendanceSheet({ 
  students, 
  date, 
  className,
  onSave,
  isLoading = false
}: AttendanceSheetProps) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    // Initialize with existing attendance data or default to present
    students.reduce((acc, student) => {
      acc[student.id] = student.currentAttendance?.present ?? true;
      return acc;
    }, {} as Record<string, boolean>)
  );
  
  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };
  
  const markAllPresent = () => {
    const newAttendance = { ...attendance };
    students.forEach(student => {
      newAttendance[student.id] = true;
    });
    setAttendance(newAttendance);
  };
  
  const markAllAbsent = () => {
    const newAttendance = { ...attendance };
    students.forEach(student => {
      newAttendance[student.id] = false;
    });
    setAttendance(newAttendance);
  };
  
  const handleSave = () => {
    const attendanceData = students.map(student => ({
      studentId: student.id,
      present: attendance[student.id]
    }));
    onSave(attendanceData);
  };
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  console.log('🎯 AttendanceSheet received students:', students);
  console.log('🎯 Length in component:', students?.length);
  console.log('className:', className);
  console.log('🎯 AttendanceSheet is rendering!');
  
  // Add safety check for empty students array
  if (!students || students.length === 0) {
    return (
      <Card className="p-6 shadow-md" variant="purple">
        <div className="text-center py-8">
          <span className="material-icons-outlined text-4xl text-gray-400 mb-2">
            group
          </span>
          <p className="text-gray-500">No students found for this class</p>
          <p className="text-sm text-gray-400 mt-2">Students: {JSON.stringify(students)}</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6 shadow-md" variant="purple">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attendance Sheet</h2>
            <p className="text-gray-600">{className} • {formattedDate}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="success" 
              onClick={markAllPresent}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <span className="material-icons-outlined text-sm">check_circle</span>
              Mark All Present
            </Button>
            <Button 
              variant="danger" 
              onClick={markAllAbsent}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <span className="material-icons-outlined text-sm">cancel</span>
              Mark All Absent
            </Button>
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-lamaPurpleLight">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-lamaPurpleLight transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {student.img ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={student.img}
                            alt={`${student.name} ${student.surname}`}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-lamaPurple flex items-center justify-center">
                            <span className="text-gray-700 text-sm font-medium">
                              {student.name.charAt(0)}{student.surname.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name} {student.surname}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAttendance(student.id)}
                      disabled={isLoading}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                        attendance[student.id]
                          ? 'bg-lamaGreenLight text-green-800 hover:bg-lamaGreen hover:text-white'
                          : 'bg-red-100 text-red-800 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <span className="material-icons-outlined text-sm">
                        {attendance[student.id] ? 'check_circle' : 'cancel'}
                      </span>
                      {attendance[student.id] ? 'Present' : 'Absent'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <span className="material-icons-outlined text-sm">save</span>
            {isLoading ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
