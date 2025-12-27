import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSubscriptionStatus } from '@/utils/subscription'
import { getProjects } from '@/app/actions/projects'
import Navbar from '@/components/Navbar'
import ProjectsList from '@/components/ProjectsList'
import CreateProjectForm from '@/components/CreateProjectForm'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const subscriptionStatus = await getSubscriptionStatus()
  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!subscriptionStatus.isActive && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              Your subscription is inactive. Manage your projects in read-only mode.{' '}
              <a href="/billing" className="font-medium underline">
                Update billing
              </a>
            </p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CreateProjectForm hasAccess={subscriptionStatus.isActive} />
          </div>

          <div className="lg:col-span-2">
            <ProjectsList projects={projects} hasAccess={subscriptionStatus.isActive} />
          </div>
        </div>
      </main>
    </div>
  )
}
