import Image from "next/image";
import prisma from "@/lib/prisma";

const SchoolsOverviewChart = async () => {
  // Mock school data for now - will be real when School model is added
  const mockSchools = [
    { name: "Greenwood High School", students: 1200, teachers: 45, status: "active" },
    { name: "Riverside Middle School", students: 800, teachers: 32, status: "active" },
    { name: "Oak Elementary", students: 600, teachers: 28, status: "active" },
    { name: "Pine Valley Academy", students: 950, teachers: 38, status: "active" },
    { name: "Sunset High School", students: 750, teachers: 29, status: "inactive" },
  ];

  // Get real data for students and teachers per "mock school"
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.teacher.count();

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Schools Overview</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {/* SCHOOLS LIST */}
      <div className="space-y-4 max-h-[320px] overflow-y-auto">
        {mockSchools.map((school, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                school.status === 'active' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div>
                <h3 className="font-medium text-sm">{school.name}</h3>
                <p className="text-xs text-gray-500">
                  {school.students} students • {school.teachers} teachers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                school.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {school.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              <button className="p-1 hover:bg-gray-200 rounded">
                <Image src="/view.png" alt="View" width={16} height={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Platform Totals:</span>
          <span className="font-medium">
            {totalStudents} students • {totalTeachers} teachers
          </span>
        </div>
      </div>
    </div>
  );
};

export default SchoolsOverviewChart;
