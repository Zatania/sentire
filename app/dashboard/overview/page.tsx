import { redirect } from 'next/navigation'

export default function TeacherOverviewRedirect() {
  redirect('/dashboard/teacher')
}