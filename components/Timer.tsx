'use client'

import { useState, useEffect } from 'react'
import { startTimer, stopTimer } from '@/app/actions/timeEntries'

interface TimerProps {
  initialActiveTimer: any
  projects: any[]
  hasAccess: boolean
}

export default function Timer({ initialActiveTimer, projects, hasAccess }: TimerProps) {
  const [activeTimer, setActiveTimer] = useState(initialActiveTimer)
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || '')
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (activeTimer) {
      const startTime = new Date(activeTimer.start_time).getTime()
      const updateElapsed = () => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000))
      }
      updateElapsed()
      const interval = setInterval(updateElapsed, 1000)
      return () => clearInterval(interval)
    }
  }, [activeTimer])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    if (!hasAccess) {
      setError('Please subscribe to start tracking time')
      return
    }

    if (!selectedProject) {
      setError('Please select a project')
      return
    }

    setLoading(true)
    setError(null)
    const result = await startTimer(selectedProject)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      window.location.reload()
    }
  }

  const handleStop = async () => {
    if (!hasAccess) {
      setError('Cannot stop timer - subscription inactive')
      return
    }

    setLoading(true)
    setError(null)
    const result = await stopTimer()
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setActiveTimer(null)
      setElapsed(0)
      window.location.reload()
    }
  }

  if (activeTimer) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Currently tracking</p>
          <p className="text-xl font-semibold text-gray-900">{activeTimer.projects?.name}</p>
        </div>
        <div className="mb-6">
          <p className="text-5xl font-bold text-blue-600 tabular-nums">{formatTime(elapsed)}</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <button
          onClick={handleStop}
          disabled={loading}
          className="w-full py-3 px-6 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Stopping...' : 'Stop Timer'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Start Timer</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No projects yet</p>
          <a
            href="/projects"
            className="inline-block py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            Create Project
          </a>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
              Select Project
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} (${project.hourly_rate}/hr)
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleStart}
            disabled={loading || !selectedProject}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Timer'}
          </button>
        </>
      )}
    </div>
  )
}
