'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  getClassesForTeacherAttendance, 
  getStudentsForAttendance, 
  saveAttendance 
} from '@/lib/actions';
import { useAuth } from '@clerk/nextjs';

type ClassType = {
  id: number;
  name: string;
  studentCount: number;
  attendanceStatus?: 'taken' | 'not-taken';
};

type AttendanceClassSelectorProps = {
  classes: ClassType[];
  onSelectClass: (classId: number) => void;
  isLoading?: boolean;
};

export default function AttendanceClassSelector({
  classes,
  onSelectClass,
  isLoading = false
}: AttendanceClassSelectorProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

// const { userId } = useAuth();
// const [error, setError] = useState(null);
// const [fetchedClasses, setFetchedClasses] = useState([]);

  // useEffect(()=>{
  //   async function fetchClasses(){
  //     if(!userId) return;
  //       const result= await getClassesForTeacherAttendance(userId);
   
  //       if(result.success){
  //            const mapped=result.data.map((c:any)=>({
  //         id: c.id,
  //         name: c.name,
  //         studentCount: c._count?.students??0,
  //         attendanceStatus: c.attendanceStatus ? 'taken':'not-taken'
  //     }))

  //             setFetchedClasses(mapped);
    
  //             console.log("the results are"+result.data);
  //             console.log("fethced "+fetchedClasses);
  //       }else{
  //           setError(result.message);
  //       }
  //   }
  //   fetchClasses();
  // },[userId])


   //const classesToRender = classes.length > 0 ? classes : fetchedClasses;
    // const classesToRender = classes.length > 0 ? fetchedClasses : classes;
  return (

    

    <Card className="p-6 shadow-md" variant="purple">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Take Attendance</h2>
          <p className="text-gray-600">Today, {today}</p>
        </div>
        <div className="flex items-center text-gray-600">
          <span className="material-icons-outlined mr-2">event</span>
          <span>Classes you supervise</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div 
            key={cls.id} 
            className={`border rounded-lg p-4 transition-all ${
              cls.attendanceStatus === 'taken' 
                ? 'bg-lamaGreenLight border-lamaGreen' 
                : 'bg-white hover:bg-lamaPurpleLight hover:border-lamaPurple'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-lg text-gray-800">{cls.name}</h3>
              {cls.attendanceStatus && (
                <span 
                  className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                    cls.attendanceStatus === 'taken' 
                      ? 'bg-lamaGreen text-white' 
                      : 'bg-lamaYellow text-gray-800'
                  }`}
                >
                  <span className="material-icons-outlined text-xs">
                    {cls.attendanceStatus === 'taken' ? 'check_circle' : 'pending'}
                  </span>
                  {cls.attendanceStatus === 'taken' ? 'Taken' : 'Not Taken'}
                </span>
              )}
            </div>
            <div className="flex items-center text-gray-600 mb-4">
              <span className="material-icons-outlined text-sm mr-1">group</span>
              <p className="text-sm">
                {cls.studentCount} student{cls.studentCount !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => onSelectClass(cls.id)}
              disabled={isLoading}
              className="w-full"
              variant={cls.attendanceStatus === 'taken' ? 'outline' : 'default'}
            >
              <span className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm">
                  {cls.attendanceStatus === 'taken' ? 'visibility' : 'edit'}
                </span>
                {cls.attendanceStatus === 'taken' ? 'View Attendance' : 'Take Attendance'}
              </span>
            </Button>
          </div>
        ))}
      </div>
      
      {classes.length === 0 && (
        <div className="text-center py-8">
          <span className="material-icons-outlined text-4xl text-gray-400 mb-2">
            school
          </span>
          <p className="text-gray-500">You are not supervising any classes</p>
        </div>
      )}
    </Card>
  );
}