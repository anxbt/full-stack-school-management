import { Metadata } from "next";
import SchoolWithAdminForm from "@/components/SchoolWithAdminForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create School | School Management System",
  description: "Create a new school with administrator in the school management system",
};

const CreateSchoolPage = async () => {
  const { userId } = auth();
  
  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-semibold">Create New School & Administrator</h1>
      </div>
      
      <div className="flex items-center text-sm mb-6">
        <Link href="/super-admin" className="text-gray-500 hover:text-lamaPurple">
          Dashboard
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link href="/super-admin/schools" className="text-gray-500 hover:text-lamaPurple">
          Schools
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-lamaPurple">Create</span>
      </div>
      
      <div className="bg-white p-6 rounded-md shadow-sm">
        <SchoolWithAdminForm />
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Creation Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-lamaPurple pl-4">
            <h3 className="font-medium mb-2">School Information</h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>School name is required</li>
              <li>School code is optional but recommended</li>
              <li>Contact information helps with communication</li>
            </ul>
          </div>
          <div className="border-l-4 border-lamaSky pl-4">
            <h3 className="font-medium mb-2">Administrator Account</h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>Admin account will be created automatically</li>
              <li>Username and password are required</li>
              <li>Admin can manage the school after creation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSchoolPage;
