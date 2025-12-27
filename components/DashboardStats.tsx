interface DashboardStatsProps {
  totalHours: number
  totalRevenue: number
}

export default function DashboardStats({ totalHours, totalRevenue }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Hours</h3>
        <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(2)}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
      </div>
    </div>
  )
}
