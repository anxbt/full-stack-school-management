import Image from "next/image";
import Link from "next/link";
import SuperAdminSchoolCards from "@/components/SuperAdminSchoolCards";
import { getSchoolsWithCache } from "@/lib/actions";

const SuperAdminPage = async () => {
  // Fetch the most recent schools for the dashboard
  const [recentSchools] = await getSchoolsWithCache(1, {});

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Super Admin Dashboard</h1>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Stats and Platform Users */}
        <div className="lg:col-span-2">
          {/* Stats Cards */}
          <div className="flex flex-wrap gap-4 mb-6">
            <SuperAdminSchoolCards type="schools" />
            <SuperAdminSchoolCards type="users" />
            <SuperAdminSchoolCards type="active" />
            <SuperAdminSchoolCards type="revenue" />
          </div>
          
          {/* Platform Users */}
          <div className="bg-white p-4 rounded-md shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Platform Users</h2>
              <Link href="/super-admin/users" className="text-lamaPurple text-sm">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-lamaSkyLight p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Admins</h3>
                  <div className="w-8 h-8 rounded-full bg-lamaSky flex items-center justify-center">
                    <Image src="/profile.png" alt="Admins" width={16} height={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">24</p>
                <p className="text-xs text-gray-500">+2 this month</p>
              </div>
              <div className="bg-lamaPurpleLight p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Teachers</h3>
                  <div className="w-8 h-8 rounded-full bg-lamaPurple flex items-center justify-center">
                    <Image src="/teacher.png" alt="Teachers" width={16} height={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">118</p>
                <p className="text-xs text-gray-500">+12 this month</p>
              </div>
              <div className="bg-lamaYellowLight p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Students</h3>
                  <div className="w-8 h-8 rounded-full bg-lamaYellow flex items-center justify-center">
                    <Image src="/student.png" alt="Students" width={16} height={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">1,240</p>
                <p className="text-xs text-gray-500">+85 this month</p>
              </div>
            </div>
          </div>
          
          {/* Platform Status */}
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Platform Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">System Health</h3>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>All systems operational</span>
                </div>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Storage Usage</h3>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-lamaSky w-1/3"></div>
                </div>
                <span className="text-xs text-gray-500">33% used</span>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Last Deployment</h3>
                <div className="text-sm">
                  <p>Today at 12:45 PM</p>
                  <p className="text-gray-500">Version 1.0.3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Quick Actions */}
        <div className="lg:col-span-1">
          {/* Quick Actions */}
          <div className="bg-white p-4 rounded-md shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Link href="/super-admin/schools/create">
                <div className="bg-lamaPurpleLight p-4 rounded-md flex items-center gap-3 hover:bg-lamaPurple hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-lamaPurple flex items-center justify-center">
                    <Image src="/create.png" alt="Create School" width={20} height={20} />
                  </div>
                  <span>Create New School</span>
                </div>
              </Link>
              <Link href="/super-admin/schools">
                <div className="bg-lamaSkyLight p-4 rounded-md flex items-center gap-3 hover:bg-lamaSky hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-lamaSky flex items-center justify-center">
                    <Image src="/singleBranch.png" alt="Manage Schools" width={20} height={20} />
                  </div>
                  <span>Manage Schools</span>
                </div>
              </Link>
              <Link href="/super-admin/users">
                <div className="bg-lamaYellowLight p-4 rounded-md flex items-center gap-3 hover:bg-lamaYellow hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-lamaYellow flex items-center justify-center">
                    <Image src="/student.png" alt="Manage Users" width={20} height={20} />
                  </div>
                  <span>Manage Users</span>
                </div>
              </Link>
              <Link href="/super-admin/settings">
                <div className="bg-lamaGreenLight p-4 rounded-md flex items-center gap-3 hover:bg-lamaGreen hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-lamaGreen flex items-center justify-center">
                    <Image src="/setting.png" alt="Platform Settings" width={20} height={20} />
                  </div>
                  <span>Platform Settings</span>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Recent Schools - Scrollable */}
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Schools</h2>
              <Link href="/super-admin/schools" className="text-lamaPurple text-sm">
                View All
              </Link>
            </div>
            {recentSchools.length > 0 ? (
              <div className="max-h-96 overflow-y-auto pr-2">
                <div className="flex flex-col gap-3">
                  {recentSchools.map((school) => (
                    <Link href={`/super-admin/schools/${school.id}`} key={school.id}>
                      <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <Image 
                            src={school.logo || "/singleBranch.png"} 
                            alt={school.name} 
                            width={40} 
                            height={40} 
                            className="rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-medium">{school.name}</h3>
                            <p className="text-xs text-gray-500">{school.code || "No code"}</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            {school._count?.students || 0} Students
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${school.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {school.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-md text-center text-gray-500">
                No schools found. <Link href="/super-admin/schools/create" className="text-lamaPurple">Create your first school</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;
