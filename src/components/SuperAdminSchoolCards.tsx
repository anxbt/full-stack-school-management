import prisma from "@/lib/prisma";
import Image from "next/image";

const SuperAdminSchoolCards = async ({
  type,
}: {
  type: "schools" | "users" | "active" | "revenue";
}) => {
  let data;
  let label;
  let icon;
  let bgColor;

  switch (type) {
    case "schools":
      // Mock data for now - will be real when School model is added
      const schoolCount = await prisma.school?.count?.() ?? 0;
      data = schoolCount;
      label = "Total Schools";
      icon = "/school.png";
      bgColor = "bg-lamaPurple";
      break;
    case "users":
      const [adminCount, teacherCount, studentCount, parentCount] = await Promise.all([
        prisma.admin.count(),
        prisma.teacher.count(), 
        prisma.student.count(),
        prisma.parent.count(),
      ]);
      data = adminCount + teacherCount + studentCount + parentCount;
      label = "Total Users";
      icon = "/student.png";
      bgColor = "bg-lamaYellow";
      break;
    case "active":
      // Mock data for now - will be real when School model is added
      data = 4;
      label = "Active Schools";
      icon = "/attendance.png";
      bgColor = "bg-lamaSky";
      break;
    case "revenue":
      // Mock data for now - you can connect to billing system later
      data = "0";
      label = "Monthly Revenue";
      icon = "/finance.png";
      bgColor = "bg-lamaGreen";
      break;
  }

  return (
    <div className={`rounded-2xl ${bgColor} p-4 flex-1 min-w-[130px] text-white`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          Platform
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{data}</h1>
      <h2 className="text-sm font-medium opacity-80">{label}</h2>
    </div>
  );
};

export default SuperAdminSchoolCards;
