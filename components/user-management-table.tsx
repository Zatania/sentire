'use client'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Search, UserMinus, ShieldCheck } from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  course?: string
  year_level?: string
}

interface UserManagementTableProps {
  users?: UserProfile[]
}

export function UserManagementTable({ users = [] }: UserManagementTableProps) {
  // Empty State: Show this when no users are found in the database
  if (users.length === 0) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-slate-900 dark:text-slate-50 font-medium">No Users Found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px] mt-1">
            There are currently no registered students or faculty in the system.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Filter by name or email..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export CSV</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Program</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{user.full_name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                  }`}>
                  {user.role}
                </span>
              </TableCell>
              <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                {user.course || 'N/A'} {user.year_level ? `(${user.year_level})` : ''}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <UserMinus className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}