import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

const PlatformStatsContainer = async () => {
  // Get user distribution data
  const [adminCount, teacherCount, studentCount, parentCount] = await Promise.all([
    prisma.admin.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.parent.count(),
  ]);

  const totalUsers = adminCount + teacherCount + studentCount + parentCount;

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Platform Users</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      
      {/* STATS */}
      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-lamaPurple rounded-full" />
            <span className="text-sm">Students</span>
          </div>
          <div className="text-right">
            <p className="font-semibold">{studentCount}</p>
            <p className="text-xs text-gray-400">
              {totalUsers > 0 ? Math.round((studentCount / totalUsers) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-lamaYellow rounded-full" />
            <span className="text-sm">Teachers</span>
          </div>
          <div className="text-right">
            <p className="font-semibold">{teacherCount}</p>
            <p className="text-xs text-gray-400">
              {totalUsers > 0 ? Math.round((teacherCount / totalUsers) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-lamaSky rounded-full" />
            <span className="text-sm">Parents</span>
          </div>
          <div className="text-right">
            <p className="font-semibold">{parentCount}</p>
            <p className="text-xs text-gray-400">
              {totalUsers > 0 ? Math.round((parentCount / totalUsers) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-lamaGreen rounded-full" />
            <span className="text-sm">Admins</span>
          </div>
          <div className="text-right">
            <p className="font-semibold">{adminCount}</p>
            <p className="text-xs text-gray-400">
              {totalUsers > 0 ? Math.round((adminCount / totalUsers) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* TOTAL */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Users</span>
          <span className="text-xl font-bold text-lamaPurple">{totalUsers}</span>
        </div>
      </div>
    </div>
  );
};

export default PlatformStatsContainer;
