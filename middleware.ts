import { createServerClient, type NextRequest } from '@supabase/ssr'
import { NextResponse } from 'next/server'

async function getProfileRole(supabase: any, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  return data?.role ?? null
}

async function getStudentOnboarding(supabase: any, userId: string) {
  const { data } = await supabase
    .from('students')
    .select('is_onboarded')
    .eq('user_id', userId)
    .maybeSingle()

  return !!data?.is_onboarded
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isAuthRoute = pathname.startsWith('/auth')
  const isDashboardRoute = pathname.startsWith('/dashboard')

  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (!user) return response

  const role = await getProfileRole(supabase, user.id)

  if (!role && pathname !== '/auth/select-role') {
    return NextResponse.redirect(new URL('/auth/select-role', request.url))
  }

  if (pathname === '/auth/login') {
    if (role === 'student') {
      const isOnboarded = await getStudentOnboarding(supabase, user.id)
      return NextResponse.redirect(
        new URL(isOnboarded ? '/dashboard/student' : '/dashboard/student/onboarding', request.url)
      )
    }
    if (role === 'teacher') {
      return NextResponse.redirect(new URL('/dashboard/teacher', request.url))
    }
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url))
    }
  }

  // Role guards
  if (pathname.startsWith('/dashboard/student') && role !== 'student') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/dashboard/teacher') && role !== 'teacher' && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Student onboarding gate
  if (role === 'student') {
    const isOnboarded = await getStudentOnboarding(supabase, user.id)
    const onboardingPath = '/dashboard/student/onboarding'

    if (!isOnboarded && pathname.startsWith('/dashboard') && pathname !== onboardingPath) {
      return NextResponse.redirect(new URL(onboardingPath, request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}