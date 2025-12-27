import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSubscriptionStatus } from '@/utils/subscription'
import { getProjects } from '@/app/actions/projects'
import { getTimeEntries } from '@/app/actions/timeEntries'
import Navbar from '@/components/Navbar'
import ManualEntryForm from '@/components/ManualEntryForm'
import ReportsTable from '@/components/ReportsTable'
import ExportButtons from '@/components/ExportButtons'

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const subscriptionStatus = await getSubscriptionStatus()
  const projects = await getProjects()
  const timeEntries = await getTimeEntries()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!subscriptionStatus.isActive && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              Your subscription is inactive. Reports are view-only.{' '}
              <a href="/billing" className="font-medium underline">
                Update billing
              </a>
            </p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <ManualEntryForm projects={projects} hasAccess={subscriptionStatus.isActive} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Export Reports</h2>
                <ExportButtons
                  timeEntries={timeEntries}
                  hasAccess={subscriptionStatus.isActive}
                />
              </div>
              <p className="text-sm text-gray-600">
                Export your time entries as CSV or PDF for easy record-keeping and invoicing.
              </p>
            </div>
          </div>
        </div>

        <ReportsTable timeEntries={timeEntries} hasAccess={subscriptionStatus.isActive} />
      </main>
    </div>
  )
}
