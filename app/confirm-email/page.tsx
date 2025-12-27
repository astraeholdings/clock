import Link from 'next/link'

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Check your email
          </h2>
          <p className="mt-4 text-base text-gray-600">
            We've sent you an email with a confirmation link. Please check your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              try signing up again
            </Link>
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
