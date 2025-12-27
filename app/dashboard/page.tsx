import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSubscriptionStatus } from '@/utils/subscription'
import { getProjects } from '@/app/actions/projects'
import { getActiveTimer, getTimeEntries } from '@/app/actions/timeEntries'
import Navbar from '@/components/Navbar'
import Timer from '@/components/Timer'
import DashboardStats from '@/components/DashboardStats'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const subscriptionStatus = await getSubscriptionStatus()
  const projects = await getProjects()
  const activeTimer = await getActiveTimer()
  const timeEntries = await getTimeEntries()

  const totalHours = timeEntries
    .filter(entry => entry.duration_seconds)
    .reduce((acc, entry) => acc + (entry.duration_seconds || 0), 0) / 3600

  const totalRevenue = timeEntries
    .filter(entry => entry.duration_seconds && entry.projects)
    .reduce((acc, entry) => {
      const hours = (entry.duration_seconds || 0) / 3600
      const rate = entry.projects?.hourly_rate || 0
      return acc + (hours * rate)
    }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!subscriptionStatus.isActive && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              Your subscription is inactive. Please{' '}
              <a href="/billing" className="font-medium underline">
                update your billing
              </a>{' '}
              to continue tracking time.
            </p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        <DashboardStats totalHours={totalHours} totalRevenue={totalRevenue} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Timer
            initialActiveTimer={activeTimer}
            projects={projects}
            hasAccess={subscriptionStatus.isActive}
          />

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Entries</h2>
            {timeEntries.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No time entries yet</p>
            ) : (
              <div className="space-y-3">
                {timeEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{entry.projects?.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.start_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {entry.duration_seconds
                          ? `${(entry.duration_seconds / 3600).toFixed(2)} hrs`
                          : 'Running...'}
                      </p>
                      {entry.duration_seconds && entry.projects?.hourly_rate && (
                        <p className="text-sm text-gray-600">
                          ${((entry.duration_seconds / 3600) * entry.projects.hourly_rate).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
