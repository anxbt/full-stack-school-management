import { Metadata } from "next";
import SchoolForm from "@/components/forms/SchoolForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create School | School Management System",
  description: "Create a new school in the school management system",
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
        <h1 className="text-2xl font-semibold">Create New School</h1>
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
        <SchoolForm />
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">School Creation Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-lamaPurple pl-4">
            <h3 className="font-medium mb-2">Required Information</h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>School name (required)</li>
              <li>School code (optional, but recommended for identification)</li>
              <li>Contact information (email, phone, address)</li>
            </ul>
          </div>
          <div className="border-l-4 border-lamaSky pl-4">
            <h3 className="font-medium mb-2">After Creation</h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>You can add administrators to the school</li>
              <li>Set up grades and classes</li>
              <li>Configure school-specific settings</li>
              <li>Schools are activated by default</li>
            </ul>
          </div>
          <div className="border-l-4 border-lamaYellow pl-4">
            <h3 className="font-medium mb-2">Logo Guidelines</h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>Recommended size: 200x200 pixels</li>
              <li>Supported formats: PNG, JPG, SVG</li>
              <li>Max file size: 2MB</li>
            </ul>
          </div>
          <div className="border-l-4 border-lamaGreen pl-4">
            <h3 className="font-medium mb-2">Domain Settings</h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>Optional custom domain for school portal</li>
              <li>Format example: school.edu or myschool.com</li>
              <li>Can be configured later</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSchoolPage;
