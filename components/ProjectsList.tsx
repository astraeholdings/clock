'use client'

import { useState } from 'react'
import { updateProject, deleteProject } from '@/app/actions/projects'

interface Project {
  id: string
  name: string
  hourly_rate: number
  created_at: string
}

interface ProjectsListProps {
  projects: Project[]
  hasAccess: boolean
}

export default function ProjectsList({ projects, hasAccess }: ProjectsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpdate(projectId: string, formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await updateProject(projectId, formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setEditingId(null)
      setLoading(false)
    }
  }

  async function handleDelete(projectId: string) {
    if (!confirm('Are you sure you want to delete this project? All associated time entries will also be deleted.')) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await deleteProject(projectId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No projects yet. Create your first project to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {projects.map((project) => (
          <div key={project.id} className="p-6">
            {editingId === project.id ? (
              <form
                action={(formData) => handleUpdate(project.id, formData)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={project.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    defaultValue={project.hourly_rate}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ${project.hourly_rate.toFixed(2)}/hour
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(project.id)}
                    disabled={!hasAccess || loading}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={!hasAccess || loading}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
