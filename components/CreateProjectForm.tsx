'use client'

import { useState } from 'react'
import { createProject } from '@/app/actions/projects'

interface CreateProjectFormProps {
  hasAccess: boolean
}

export default function CreateProjectForm({ hasAccess }: CreateProjectFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createProject(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      const form = document.getElementById('create-project-form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Project</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <form id="create-project-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            disabled={!hasAccess}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-1">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            id="hourly_rate"
            name="hourly_rate"
            step="0.01"
            min="0"
            required
            disabled={!hasAccess}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !hasAccess}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
