'use client'

import { useState } from 'react'
import { deleteTimeEntry } from '@/app/actions/timeEntries'

interface ReportsTableProps {
  timeEntries: any[]
  hasAccess: boolean
}

export default function ReportsTable({ timeEntries, hasAccess }: ReportsTableProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(entryId: string) {
    if (!confirm('Are you sure you want to delete this time entry?')) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await deleteTimeEntry(entryId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  if (timeEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No time entries yet. Start tracking time or add a manual entry.</p>
      </div>
    )
  }

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeEntries.map((entry) => {
              const hours = entry.duration_seconds ? (entry.duration_seconds / 3600).toFixed(2) : '-'
              const rate = entry.projects?.hourly_rate || 0
              const amount = entry.duration_seconds ? ((entry.duration_seconds / 3600) * rate).toFixed(2) : '-'

              return (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.projects?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(entry.start_time).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(entry.start_time).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {entry.end_time ? new Date(entry.end_time).toLocaleTimeString() : 'Running...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {hours} {hours !== '-' ? 'hrs' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${rate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {amount !== '-' ? `$${amount}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={!hasAccess || loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {totalHours.toFixed(2)} hrs
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                -
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                ${totalRevenue.toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
