import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('programs')
      .select('id, code, name')
      .order('code', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ programs: data ?? [] })
  } catch (error) {
    console.error('Programs fetch error:', error)
    return NextResponse.json({ error: 'Failed to load programs' }, { status: 500 })
  }
}