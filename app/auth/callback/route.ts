import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getSiteUrl(requestUrl: string) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(requestUrl).origin

  return configuredUrl.replace(/\/$/, '')
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const siteUrl = getSiteUrl(request.url)

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/auth/login?error=Missing+verification+code`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Email verification error:', error.message)

    return NextResponse.redirect(
      `${siteUrl}/auth/login?error=${encodeURIComponent(error.message)}`
    )
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${siteUrl}/auth/update-password`)
  }

  return NextResponse.redirect(`${siteUrl}/auth/login?message=Email+verified+successfully`)
}