import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type AttendanceRecord = {
  id: number;
  date: string;
  student: {
    id: string;
    name: string;
    surname: string;
    img: string | null;
  };
  present: boolean;
  updatedBy?: string;
  updatedAt?: string;
};

type AttendanceHistoryProps = {
  records: AttendanceRecord[];
  className: string;
  onEditRecord: (recordId: number, present: boolean) => void;
  isLoading?: boolean;
};

export default function AttendanceHistory({
  records,
  className,
  onEditRecord,
  isLoading = false
}: AttendanceHistoryProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Group records by date
  const recordsByDate = records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);
  
  // Get unique dates
  const dates = Object.keys(recordsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  
  // If no date is selected, select the most recent one
  if (!selectedDate && dates.length > 0) {
    setSelectedDate(dates[0]);
  }
  
  const selectedRecords = selectedDate ? recordsByDate[selectedDate] : [];
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const toggleAttendance = (recordId: number, currentValue: boolean) => {
    onEditRecord(recordId, !currentValue);
  };
  
  return (
    <Card className="p-6 shadow-md" variant="sky">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance History</h2>
          <p className="text-gray-600">{className}</p>
        </div>
        <div className="flex items-center text-gray-600">
          <span className="material-icons-outlined mr-2">history</span>
          <span>Past attendance records</span>
        </div>
      </div>
      
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2">
          {dates.map(date => (
            <Button
              key={date}
              variant={selectedDate === date ? 'default' : 'outline'}
              onClick={() => setSelectedDate(date)}
              disabled={isLoading}
              className="whitespace-nowrap flex items-center gap-1"
            >
              <span className="material-icons-outlined text-sm">event</span>
              {formatDate(date)}
            </Button>
          ))}
          {dates.length === 0 && (
            <p className="text-gray-500 py-2">No attendance records found</p>
          )}
        </div>
      </div>
      
      {selectedDate && (
        <div className="border rounded-md overflow-hidden bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-lamaSkyLight">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-lamaSkyLight transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {record.student.img ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={record.student.img}
                            alt={`${record.student.name} ${record.student.surname}`}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-lamaSky flex items-center justify-center">
                            <span className="text-gray-700 text-sm font-medium">
                              {record.student.name.charAt(0)}{record.student.surname.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.student.name} {record.student.surname}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                      record.present
                        ? 'bg-lamaGreenLight text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="material-icons-outlined text-sm">
                        {record.present ? 'check_circle' : 'cancel'}
                      </span>
                      {record.present ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.updatedBy ? (
                      <div className="flex items-center">
                        <span className="material-icons-outlined text-sm mr-1">update</span>
                        <div>
                          <div>By: {record.updatedBy}</div>
                          <div>{new Date(record.updatedAt || '').toLocaleString()}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="material-icons-outlined text-sm mr-1">check</span>
                        <span>Original entry</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      variant="ghost"
                      onClick={() => toggleAttendance(record.id, record.present)}
                      disabled={isLoading}
                      className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                    >
                      <span className="material-icons-outlined text-sm">edit</span>
                      Mark as {record.present ? 'Absent' : 'Present'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {(!selectedDate || selectedRecords.length === 0) && (
        <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
          <span className="material-icons-outlined text-5xl text-gray-300 mb-2">history</span>
          <p className="text-gray-500">No attendance records found for the selected date</p>
        </div>
      )}
    </Card>
  );
}