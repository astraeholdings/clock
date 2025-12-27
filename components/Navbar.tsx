'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              clocko
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/dashboard" className={isActive('/dashboard')}>
                Dashboard
              </Link>
              <Link href="/projects" className={isActive('/projects')}>
                Projects
              </Link>
              <Link href="/reports" className={isActive('/reports')}>
                Reports
              </Link>
              <Link href="/billing" className={isActive('/billing')}>
                Billing
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
