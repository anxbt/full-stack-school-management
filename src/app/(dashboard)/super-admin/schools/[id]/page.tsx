import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { School } from "@prisma/client";

type SchoolWithCounts = School & { 
  _count: { 
    students: number; 
    teachers: number;
    admins: number;
    parents: number;
    Class: number;
    Subject: number;
  } 
};

const SchoolDetailPage = async ({ params }: { params: { id: string } }) => {
  const school = await prisma.school.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          students: true,
          teachers: true,
          admins: true,
          parents: true,
          Class: true,
          Subject: true,
        },
      },
    },
  }) as SchoolWithCounts | null;

  if (!school) {
    redirect("/super-admin/schools");
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">School Details</h1>
        <div className="flex gap-2">
          <Link href={`/super-admin/schools/${params.id}/edit`}>
            <button className="bg-lamaYellow text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Image src="/update.png" alt="Edit" width={16} height={16} />
              <span>Edit</span>
            </button>
          </Link>
          <Link href="/super-admin/schools">
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md">
              Back to List
            </button>
          </Link>
        </div>
      </div>

      {/* School Profile */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-square relative rounded-md overflow-hidden bg-gray-100">
            <Image
              src={school.logo || "/singleBranch.png"}
              alt={school.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold">{school.name}</h2>
              <p className="text-gray-500 text-sm">{school.code || "No code set"}</p>
              
              <div className="mt-4">
                <div className="mb-2">
                  <span className="text-gray-500 text-sm">Status:</span>{" "}
                  <span className={`px-2 py-1 rounded-full text-xs ${school.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {school.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-500 text-sm">Created:</span>{" "}
                  <span>{formatDistanceToNow(new Date(school.createdAt), { addSuffix: true })}</span>
                </div>
                {school.lastLogin && (
                  <div className="mb-2">
                    <span className="text-gray-500 text-sm">Last Login:</span>{" "}
                    <span>{formatDistanceToNow(new Date(school.lastLogin), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <div className="mb-2">
                <span className="text-gray-500 text-sm">Email:</span>{" "}
                <span>{school.email || "Not provided"}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500 text-sm">Phone:</span>{" "}
                <span>{school.phone || "Not provided"}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500 text-sm">Address:</span>{" "}
                <span>{school.address || "Not provided"}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500 text-sm">Domain:</span>{" "}
                <span>{school.domain || "Not provided"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* School Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-lamaSky text-white p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Students</h3>
          <p className="text-2xl font-bold">{school._count.students}</p>
        </div>
        <div className="bg-lamaPurple text-white p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Teachers</h3>
          <p className="text-2xl font-bold">{school._count.teachers}</p>
        </div>
        <div className="bg-lamaYellow text-white p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Parents</h3>
          <p className="text-2xl font-bold">{school._count.parents}</p>
        </div>
        <div className="bg-lamaGreen text-white p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Admins</h3>
          <p className="text-2xl font-bold">{school._count.admins}</p>
        </div>
        <div className="bg-lamaPurpleLight text-white p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Classes</h3>
          <p className="text-2xl font-bold">{school._count.Class}</p>
        </div>
        <div className="bg-lamaSkyLight text-white p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Subjects</h3>
          <p className="text-2xl font-bold">{school._count.Subject}</p>
        </div>
      </div>

      {/* Placeholder for future features */}
      <div className="border rounded-md p-4 text-center text-gray-500">
        Additional school management features will be implemented here.
      </div>
    </div>
  );
};

export default SchoolDetailPage;
