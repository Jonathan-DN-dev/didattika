import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from 'lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        error: 'Supabase not configured - running in development mode'
      }, { status: 501 })
    }

    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = {
      id: session.user.id,
      email: session.user.email,
      user_type: session.user.user_metadata?.user_type || 'student',
      created_at: session.user.created_at,
      updated_at: session.user.updated_at || session.user.created_at
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
