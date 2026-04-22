import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { GraduationCap, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      {/* Top Maroon Header */}
      <header className="bg-[#800000] p-4 text-white flex items-center shadow-md">
        <div className="flex items-center gap-3 ml-4">
          <img
            src="/images/pup-logo.png"
            alt="PUP Logo"
            className="h-9 w-9 object-contain bg-white rounded-full p-0.5"
          />
          <div>
            <h2 className="text-sm font-bold leading-tight uppercase tracking-tighter">
              Polytechnic University of the Philippines
            </h2>
            <p className="text-[10px] opacity-85 tracking-wide font-medium">
              Sentire — Emotion Aware Academic Monitoring System
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Center Logo & Title */}
        <div className="mb-12 text-center animate-in fade-in zoom-in duration-500">
          <img
            src="/images/pup-logo.png"
            alt="SENTIRE Logo"
            className="h-28 w-28 mx-auto mb-6 object-contain"
          />
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Welcome to SENTIRE
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto text-lg leading-relaxed">
            An emotion-aware academic monitoring system designed to support your wellbeing and success
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mt-4">
          {/* Student Card - Maroon border removed */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-col items-center pb-2">
              {/* Centered Pill Icon Background */}
              <div className="w-full max-w-[240px] bg-[#F0F7FF] rounded-full py-3 flex justify-center items-center mb-4">
                <GraduationCap className="h-8 w-8 text-[#2563EB]" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Student</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-slate-500 px-8 text-sm leading-relaxed">
              Complete the wellness survey and track your emotional wellbeing and academic performance
            </CardContent>
            <CardFooter className="justify-center pt-4">
              <Link href="/survey" className="text-[#2563EB] font-bold hover:underline flex items-center gap-1">
                Get Started →
              </Link>
            </CardFooter>
          </Card>

          {/* Faculty / Admin Card */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-col items-center pb-2">
              {/* Centered Pill Icon Background */}
              <div className="w-full max-w-[240px] bg-[#F0FDF4] rounded-full py-3 flex justify-center items-center mb-4">
                <Users className="h-8 w-8 text-[#16A34A]" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Faculty / Admin</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-slate-500 px-8 text-sm leading-relaxed">
              Access the monitoring dashboard to view student wellness data and manage interventions
            </CardContent>
            <CardFooter className="justify-center pt-4">
              <Link href="/auth/login" className="text-[#16A34A] font-bold hover:underline flex items-center gap-1">
                Sign In →
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Professional Footer */}
        <div className="mt-24 text-center w-full max-w-2xl border-t border-slate-200 pt-8 opacity-60">
          <p className="text-[11px] text-slate-500 uppercase tracking-[0.25em] font-bold">
            SENTIRE is designed to support the holistic wellbeing of students at PUP.
          </p>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Your privacy and data security are our top priorities.
          </p>
          <p className="text-[10px] text-slate-400 mt-10">
            Polytechnic University of the Philippines © 2026
          </p>
        </div>
      </main>
    </div>
  )
}