'use client'

import { useMemo } from 'react'
import { format, subDays, isAfter } from 'date-fns'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  BookOpen,
  Heart,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface Student {
  id: string
  full_name: string | null
  student_id: string | null
  course: string | null
  year_level: number | null
  role: string
}

interface WellnessLog {
  id: string
  user_id: string
  mood: number
  stress: number
  logged_at: string
}

interface AcademicRecord {
  id: string
  user_id: string
  subject: string
  grade: number | null
  units: number | null
}

const MOOD_LABEL: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Neutral',
  4: 'Good',
  5: 'Excellent',
}

const MOOD_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981']

export function TeacherOverviewClient({
  students,
  wellnessLogs,
  academicRecords,
}: {
  students: Student[]
  wellnessLogs: WellnessLog[]
  academicRecords: AcademicRecord[]
}) {
  // Calculate stats
  const totalStudents = students.length

  // Get latest wellness for each student
  const latestWellnessMap = useMemo(() => {
    const map = new Map<string, WellnessLog>()
    wellnessLogs.forEach((log) => {
      if (!map.has(log.user_id)) {
        map.set(log.user_id, log)
      }
    })
    return map
  }, [wellnessLogs])

  // Average mood and stress
  const avgMood = useMemo(() => {
    const moods = Array.from(latestWellnessMap.values()).map((l) => l.mood)
    if (moods.length === 0) return 0
    return (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1)
  }, [latestWellnessMap])

  const avgStress = useMemo(() => {
    const stresses = Array.from(latestWellnessMap.values()).map((l) => l.stress)
    if (stresses.length === 0) return 0
    return (stresses.reduce((a, b) => a + b, 0) / stresses.length).toFixed(1)
  }, [latestWellnessMap])

  // At-risk students (mood <= 2 or stress >= 4)
  const atRiskStudents = useMemo(() => {
    return Array.from(latestWellnessMap.entries()).filter(
      ([, log]) => log.mood <= 2 || log.stress >= 4
    )
  }, [latestWellnessMap])

  // Students who checked in today
  const todayCheckIns = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return wellnessLogs.filter((log) => isAfter(new Date(log.logged_at), today)).length
  }, [wellnessLogs])

  // Mood distribution for pie chart
  const moodDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    Array.from(latestWellnessMap.values()).forEach((log) => {
      if (log.mood >= 1 && log.mood <= 5) {
        counts[log.mood - 1]++
      }
    })
    return counts.map((count, i) => ({
      name: MOOD_LABEL[i + 1],
      value: count,
      color: MOOD_COLORS[i],
    }))
  }, [latestWellnessMap])

  // Wellness trend (last 7 days)
  const trendData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStr = format(date, 'yyyy-MM-dd')
      const dayLogs = wellnessLogs.filter(
        (log) => format(new Date(log.logged_at), 'yyyy-MM-dd') === dayStr
      )
      const avgMood =
        dayLogs.length > 0
          ? dayLogs.reduce((sum, l) => sum + l.mood, 0) / dayLogs.length
          : null
      const avgStress =
        dayLogs.length > 0
          ? dayLogs.reduce((sum, l) => sum + l.stress, 0) / dayLogs.length
          : null
      days.push({
        date: format(date, 'EEE'),
        mood: avgMood ? parseFloat(avgMood.toFixed(1)) : null,
        stress: avgStress ? parseFloat(avgStress.toFixed(1)) : null,
      })
    }
    return days
  }, [wellnessLogs])

  // Average GWA
  const avgGWA = useMemo(() => {
    const studentGWAs: number[] = []
    students.forEach((student) => {
      const records = academicRecords.filter((r) => r.user_id === student.id && r.grade !== null)
      if (records.length > 0) {
        const totalUnits = records.reduce((sum, r) => sum + (r.units ?? 3), 0)
        const weightedSum = records.reduce((sum, r) => sum + (r.grade ?? 0) * (r.units ?? 3), 0)
        studentGWAs.push(weightedSum / totalUnits)
      }
    })
    if (studentGWAs.length === 0) return '—'
    return (studentGWAs.reduce((a, b) => a + b, 0) / studentGWAs.length).toFixed(2)
  }, [students, academicRecords])

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Teacher Overview</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Quick snapshot of student wellness and academic performance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          color="text-foreground"
        />
        <StatCard
          icon={Heart}
          label="Avg Mood"
          value={avgMood}
          sub="out of 5"
          color="text-primary"
        />
        <StatCard
          icon={Activity}
          label="Avg Stress"
          value={avgStress}
          sub="out of 5"
          color="text-amber-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="At-Risk"
          value={atRiskStudents.length}
          sub="need attention"
          color="text-accent"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={TrendingUp}
          label="Today's Check-ins"
          value={todayCheckIns}
          color="text-green-500"
        />
        <StatCard
          icon={BookOpen}
          label="Avg GWA"
          value={avgGWA}
          color="text-blue-500"
        />
        <div className="col-span-2 lg:col-span-1 bg-card border border-border rounded-xl p-4 sm:p-5">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Active Students
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {latestWellnessMap.size}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              / {totalStudents}
            </span>
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">have checked in</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Mood Trend Chart */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-semibold text-foreground mb-4">
            Wellness Trend (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                fill="url(#moodGradient)"
                strokeWidth={2}
                name="Avg Mood"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mood Distribution Pie Chart */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-semibold text-foreground mb-4">
            Mood Distribution
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={moodDistribution.filter((d) => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {moodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {moodDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1 text-[10px] sm:text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-Risk Students List */}
      {atRiskStudents.length > 0 && (
        <div className="bg-card border border-accent/30 rounded-xl p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-semibold text-accent mb-4 flex items-center gap-2">
            <AlertTriangle size={16} />
            Students Needing Attention
          </h2>
          <div className="space-y-2">
            {atRiskStudents.slice(0, 5).map(([userId, log]) => {
              const student = students.find((s) => s.id === userId)
              return (
                <div
                  key={userId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {student?.full_name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">{student?.course ?? '—'}</p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-medium ${
                        log.mood <= 2 ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      Mood: {log.mood}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-medium ${
                        log.stress >= 4 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      Stress: {log.stress}
                    </span>
                  </div>
                </div>
              )
            })}
            {atRiskStudents.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{atRiskStudents.length - 5} more students
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-muted-foreground" />
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${color ?? 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-[10px] sm:text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
