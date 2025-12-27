'use client'

import { useState } from 'react'
import { createManualEntry } from '@/app/actions/timeEntries'

interface ManualEntryFormProps {
  projects: any[]
  hasAccess: boolean
}

export default function ManualEntryForm({ projects, hasAccess }: ManualEntryFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await createManualEntry(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      const form = document.getElementById('manual-entry-form') as HTMLFormElement
      form?.reset()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Time Entry</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">Time entry created successfully</p>
        </div>
      )}
      <form id="manual-entry-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            id="project_id"
            name="project_id"
            required
            disabled={!hasAccess || projects.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            id="start_time"
            name="start_time"
            required
            disabled={!hasAccess}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="datetime-local"
            id="end_time"
            name="end_time"
            required
            disabled={!hasAccess}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !hasAccess || projects.length === 0}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Add Entry'}
        </button>
      </form>
    </div>
  )
}
