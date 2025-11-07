"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Users, Building2, Zap, Activity } from "lucide-react"
import { useRealtimeStats } from "../../hooks/useRealtimeStats"

export default function AdminStats() {
  const { stats, loading } = useRealtimeStats()

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-700 bg-slate-800/50 animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-700 rounded w-12"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Total Users</CardTitle>
          <Users className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          <p className="text-xs text-slate-400">Active members</p>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Corporations</CardTitle>
          <Building2 className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalCorporations}</div>
          <p className="text-xs text-slate-400">Registered corporations</p>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Characters</CardTitle>
          <Zap className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalCharacters}</div>
          <p className="text-xs text-slate-400">Total linked characters</p>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Roles</CardTitle>
          <Activity className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalRoles}</div>
          <p className="text-xs text-slate-400">Permission roles</p>
        </CardContent>
      </Card>
    </div>
  )
}
