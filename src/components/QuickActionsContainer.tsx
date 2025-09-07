import Image from "next/image";
import Link from "next/link";

const QuickActionsContainer = () => {
  const quickActions = [
    {
      title: "Create New School",
      description: "Add a new school to the platform",
      icon: "/create.png",
      href: "/super-admin/schools/create",
      bgColor: "bg-lamaPurple",
    },
    {
      title: "Manage Schools",
      description: "View and edit existing schools",
      icon: "/setting.png",
      href: "/super-admin/schools",
      bgColor: "bg-lamaYellow",
    },
    {
      title: "User Management",
      description: "Manage platform users",
      icon: "/student.png",
      href: "/super-admin/users",
      bgColor: "bg-lamaSky",
    },
    {
      title: "Analytics",
      description: "View detailed platform analytics",
      icon: "/result.png",
      href: "/super-admin/analytics",
      bgColor: "bg-lamaGreen",
    },
    {
      title: "Billing & Plans",
      description: "Manage subscriptions and billing",
      icon: "/finance.png",
      href: "/super-admin/billing",
      bgColor: "bg-purple-500",
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: "/setting.png",
      href: "/super-admin/settings",
      bgColor: "bg-gray-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl w-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Quick Actions</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {/* ACTIONS GRID */}
      <div className="space-y-3">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Image 
                  src={action.icon} 
                  alt={action.title} 
                  width={20} 
                  height={20}
                  className="filter brightness-0 invert"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{action.title}</h3>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
              <Image 
                src="/view.png" 
                alt="Go" 
                width={16} 
                height={16}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* HELP SECTION */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Image src="/announcement.png" alt="" width={16} height={16} />
            <h3 className="font-medium text-sm">Need Help?</h3>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            Check our admin documentation or contact support.
          </p>
          <Link href="/super-admin/help" className="text-xs text-lamaPurple hover:underline">
            View Documentation →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsContainer;
