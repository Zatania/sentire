import { redirect } from 'next/navigation'

export default function WellnessRedirectPage() {
  redirect('/dashboard/student/check-in')
}