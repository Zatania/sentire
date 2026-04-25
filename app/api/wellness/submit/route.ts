import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      assessment_type = 'checkin',
      overall_score = null,
      risk_level = null,
      mood = null,
      stress_level = null,
      sleep_hours = null,
      journal_text = null,
      answers = [],
    } = body

    const { data: assessment, error: assessmentError } = await supabase
      .from('wellness_assessments')
      .insert({
        student_id: user.id,
        assessment_type,
        overall_score,
        risk_level,
        mood,
        stress_level,
        sleep_hours,
        journal_text,
      })
      .select()
      .single()

    if (assessmentError) {
      return NextResponse.json({ error: assessmentError.message }, { status: 500 })
    }

    if (Array.isArray(answers) && answers.length > 0) {
      const answerRows = answers.map((item: any) => ({
        assessment_id: assessment.id,
        question_code: item.question_code,
        question_text: item.question_text,
        answer_value: item.answer_value ?? null,
        answer_numeric: item.answer_numeric ?? null,
        category: item.category ?? null,
      }))

      const { error: answersError } = await supabase
        .from('wellness_answers')
        .insert(answerRows)

      if (answersError) {
        return NextResponse.json({ error: answersError.message }, { status: 500 })
      }
    }

    // Mark onboarding complete after first initial survey
    if (assessment_type === 'initial') {
      const { error: onboardingError } = await supabase
        .from('students')
        .update({ is_onboarded: true })
        .eq('user_id', user.id)

      if (onboardingError) {
        return NextResponse.json({ error: onboardingError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, assessment })
  } catch (error) {
    console.error('Wellness submit error:', error)
    return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 })
  }
}