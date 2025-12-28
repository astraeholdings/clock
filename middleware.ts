import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  try {
    const response = await updateSession(req)

    const hasSession =
      Boolean(req.cookies.get('sb-access-token')?.value) ||
      Boolean(req.cookies.get('supabase-auth-token')?.value)

    const isAuthRoute =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/signup')

    if (!hasSession && !isAuthRoute) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      const redirectResponse = NextResponse.redirect(loginUrl)

      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie)
      })

      return redirectResponse
    }

    return response
  } catch (error) {
    console.error('Error in middleware:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
