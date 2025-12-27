'use client'

import { useState } from 'react'

interface ExportButtonsProps {
  timeEntries: any[]
  hasAccess: boolean
}

export default function ExportButtons({ timeEntries, hasAccess }: ExportButtonsProps) {
  const [loading, setLoading] = useState(false)

  const exportCSV = () => {
    setLoading(true)

    const csvContent = [
      ['Project', 'Date', 'Start Time', 'End Time', 'Duration (hrs)', 'Rate', 'Amount'],
      ...timeEntries.map(entry => {
        const hours = entry.duration_seconds ? (entry.duration_seconds / 3600).toFixed(2) : '0'
        const rate = entry.projects?.hourly_rate || 0
        const amount = entry.duration_seconds ? ((entry.duration_seconds / 3600) * rate).toFixed(2) : '0'

        return [
          entry.projects?.name || 'Unknown',
          new Date(entry.start_time).toLocaleDateString(),
          new Date(entry.start_time).toLocaleTimeString(),
          entry.end_time ? new Date(entry.end_time).toLocaleTimeString() : 'Running',
          hours,
          rate.toFixed(2),
          amount
        ]
      })
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clocko-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()

    setLoading(false)
  }

  const exportPDF = async () => {
    setLoading(true)

    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text('clocko - Time Report', 14, 20)

      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

      const tableData = timeEntries.map(entry => {
        const hours = entry.duration_seconds ? (entry.duration_seconds / 3600).toFixed(2) : '0'
        const rate = entry.projects?.hourly_rate || 0
        const amount = entry.duration_seconds ? ((entry.duration_seconds / 3600) * rate).toFixed(2) : '0'

        return [
          entry.projects?.name || 'Unknown',
          new Date(entry.start_time).toLocaleDateString(),
          new Date(entry.start_time).toLocaleTimeString(),
          entry.end_time ? new Date(entry.end_time).toLocaleTimeString() : 'Running',
          hours,
          `$${rate.toFixed(2)}`,
          `$${amount}`
        ]
      })

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

      autoTable(doc, {
        head: [['Project', 'Date', 'Start', 'End', 'Hours', 'Rate', 'Amount']],
        body: tableData,
        foot: [['', '', '', 'Total', totalHours.toFixed(2), '', `$${totalRevenue.toFixed(2)}`]],
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' }
      })

      doc.save(`clocko-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }

    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCSV}
        disabled={loading || !hasAccess || timeEntries.length === 0}
        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Exporting...' : 'Export CSV'}
      </button>
      <button
        onClick={exportPDF}
        disabled={loading || !hasAccess || timeEntries.length === 0}
        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Exporting...' : 'Export PDF'}
      </button>
    </div>
  )
}
