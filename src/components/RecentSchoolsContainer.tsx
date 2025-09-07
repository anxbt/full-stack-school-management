import Image from "next/image";
import Link from "next/link";

const RecentSchoolsContainer = ({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | undefined } 
}) => {
  // Mock recent schools data - will be real when School model is added
  const recentSchools = [
    {
      id: "1",
      name: "Greenwood High School",
      code: "GHS",
      status: "active",
      lastActivity: "2 hours ago",
      students: 1200,
      avatar: "/school.png",
      subscription: "Premium"
    },
    {
      id: "2", 
      name: "Riverside Middle School",
      code: "RMS",
      status: "active",
      lastActivity: "5 hours ago",
      students: 800,
      avatar: "/school.png",
      subscription: "Basic"
    },
    {
      id: "3",
      name: "Oak Elementary",
      code: "OE",
      status: "active", 
      lastActivity: "1 day ago",
      students: 600,
      avatar: "/school.png",
      subscription: "Premium"
    },
    {
      id: "4",
      name: "Pine Valley Academy",
      code: "PVA",
      status: "inactive",
      lastActivity: "3 days ago",
      students: 950,
      avatar: "/school.png",
      subscription: "Basic"
    },
  ];

  const upcomingEvents = [
    {
      title: "System Maintenance",
      date: "Sep 15, 2025",
      time: "2:00 AM",
      type: "maintenance"
    },
    {
      title: "Greenwood Subscription Renewal",
      date: "Sep 20, 2025", 
      time: "11:59 PM",
      type: "billing"
    },
    {
      title: "New Feature Release",
      date: "Oct 1, 2025",
      time: "9:00 AM",
      type: "feature"
    }
  ];

  return (
    <div className="bg-white rounded-xl w-full p-4">
      {/* RECENT SCHOOLS SECTION */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold">Recent Schools</h1>
          <Link href="//schools" className="text-xs text-lamaPurple hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {recentSchools.slice(0, 3).map((school) => (
            <div key={school.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="relative">
                <Image
                  src={school.avatar}
                  alt={school.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  school.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{school.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{school.students} students</span>
                  <span>•</span>
                  <span className={`px-1 rounded text-xs ${
                    school.subscription === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {school.subscription}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{school.lastActivity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPCOMING EVENTS SECTION */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
          <Image src="/moreDark.png" alt="" width={20} height={20} />
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                event.type === 'maintenance' ? 'bg-orange-500' :
                event.type === 'billing' ? 'bg-red-500' :
                'bg-blue-500'
              }`} />
              <div className="flex-1">
                <h3 className="font-medium text-sm">{event.title}</h3>
                <p className="text-xs text-gray-500">{event.date} at {event.time}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="//events" className="block text-center text-xs text-lamaPurple hover:underline mt-4">
          View All Events →
        </Link>
      </div>
    </div>
  );
};

export default RecentSchoolsContainer;
