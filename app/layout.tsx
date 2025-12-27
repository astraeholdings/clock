import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'clocko - Time Tracking for Freelancers',
  description: 'Track billable time per project and export reports. $8/month with 7-day free trial.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
