'use client'

import { useState, useTransition } from 'react'
import { User, Lock, Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  updateProfile,
  changePassword,
  updatePrivacySettings,
} from '@/app/dashboard/profile/actions'

interface Profile {
  full_name: string | null
  role: string
  course: string | null
  student_id: string | null
  year_level: number | null
}

interface PrivacySettings {
  invisibilityMode: boolean
  showDataToAdvisor: boolean
}

const COURSES = [
  'DIT-1',
  'DOMT-1',
  'BSOA-1',
  'BSAM-1',
  'BEED-1',
  'BSENT-1',
]

export function ProfileClient({
  profile,
  email,
  privacySettings,
}: {
  profile: Profile
  email: string
  privacySettings: PrivacySettings
}) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'privacy'>('profile')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [invisibilityMode, setInvisibilityMode] = useState(privacySettings.invisibilityMode)
  const [showDataToAdvisor, setShowDataToAdvisor] = useState(privacySettings.showDataToAdvisor)

  async function handleProfileSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' })
      }
    })
  }

  async function handlePasswordSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const result = await changePassword(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Password changed successfully' })
      }
    })
  }

  async function handlePrivacySubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    const formData = new FormData()
    if (invisibilityMode) formData.append('invisibility_mode', 'on')
    if (showDataToAdvisor) formData.append('show_data_to_advisor', 'on')

    startTransition(async () => {
      const result = await updatePrivacySettings(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Privacy settings updated' })
      }
    })
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4 sm:mb-6">
        Profile Settings
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 sm:mb-6 bg-muted p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id)
              setMessage(null)
            }}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none whitespace-nowrap ${
              activeTab === id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={14} className="sm:w-4 sm:h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form action={handleProfileSubmit} className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Personal Information</h2>

          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile.full_name ?? ''}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="student_id" className="text-sm">Student ID</Label>
                <Input
                  id="student_id"
                  name="student_id"
                  defaultValue={profile.student_id ?? ''}
                  placeholder="e.g., 2024-00001"
                  className="text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="year_level" className="text-sm">Year Level</Label>
                <Select name="year_level" defaultValue={profile.year_level?.toString() ?? ''}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="course">Program/Course</Label>
              <Select name="course" defaultValue={profile.course ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form action={handlePasswordSubmit} className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Change Password</h2>

          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current_password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  name="current_password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new_password">New Password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  name="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <form onSubmit={handlePrivacySubmit} className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">Privacy & Data Settings</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            Control how your emotional and wellness data is collected and shared.
          </p>

          <div className="space-y-4 sm:space-y-6">
            {/* Invisibility Mode */}
            <div className="flex items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-foreground">Invisibility Mode</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Turn off emotion tracking temporarily. Your wellness data will not be recorded while this is enabled.
                </p>
              </div>
              <Switch
                checked={invisibilityMode}
                onCheckedChange={setInvisibilityMode}
              />
            </div>

            {/* Advisor Data Sharing */}
            <div className="flex items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-foreground">Share Data with Advisor</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Allow your academic advisor or teacher to view your wellness trends and academic correlations.
                </p>
              </div>
              <Switch
                checked={showDataToAdvisor}
                onCheckedChange={setShowDataToAdvisor}
              />
            </div>

            {/* Transparency Info */}
            <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="text-xs sm:text-sm font-medium text-primary mb-2">Data Transparency</h3>
              <ul className="text-[10px] sm:text-xs text-muted-foreground space-y-1">
                <li>Your emotional data is processed locally when possible</li>
                <li>Only aggregated insights are shared with teachers (if enabled)</li>
                <li>You can request data deletion at any time</li>
                <li>AI recommendations are generated without storing personal conversations</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
