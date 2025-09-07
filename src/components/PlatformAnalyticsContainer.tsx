import Image from "next/image";

const PlatformAnalyticsContainer = async () => {
  // Mock analytics data - you can replace with real analytics later
  const mockData = {
    revenue: [
      { month: "Jan", amount: 8500 },
      { month: "Feb", amount: 9200 },
      { month: "Mar", amount: 11000 },
      { month: "Apr", amount: 10500 },
      { month: "May", amount: 12450 },
      { month: "Jun", amount: 13200 },
    ],
    growth: "+18%",
    activeSchools: 4,
    totalRevenue: 64850
  };

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Platform Analytics</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-lamaPurple to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Monthly Revenue</h3>
            <Image src="/finance.png" alt="" width={24} height={24} />
          </div>
          <p className="text-2xl font-bold">${mockData.revenue[mockData.revenue.length - 1].amount.toLocaleString()}</p>
          <p className="text-sm opacity-80">{mockData.growth} vs last month</p>
        </div>

        {/* Active Schools */}
        <div className="bg-gradient-to-r from-lamaYellow to-yellow-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Active Schools</h3>
            <Image src="/school.png" alt="" width={24} height={24} />
          </div>
          <p className="text-2xl font-bold">{mockData.activeSchools}</p>
          <p className="text-sm opacity-80">All systems operational</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-r from-lamaSky to-blue-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
            <Image src="/result.png" alt="" width={24} height={24} />
          </div>
          <p className="text-2xl font-bold">${mockData.totalRevenue.toLocaleString()}</p>
          <p className="text-sm opacity-80">Year to date</p>
        </div>
      </div>

      {/* REVENUE CHART MOCKUP */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">Revenue Trend (6 months)</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {mockData.revenue.map((item, index) => {
            const height = (item.amount / Math.max(...mockData.revenue.map(r => r.amount))) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-lamaPurple rounded-t-sm mb-1 transition-all hover:bg-purple-600"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-600">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalyticsContainer;
