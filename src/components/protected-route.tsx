"use client"

import type React from "react"

import { Navigate } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { useRole } from "../hooks/use-rbac"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "moderator" | "member"
}

export function ProtectedRoute({ children, requiredRole = "member" }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth()
  const { role, loading: roleLoading } = useRole()

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  const roleHierarchy: Record<string, number> = {
    member: 1,
    moderator: 2,
    admin: 3,
  }

  if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-red-400">You don't have permission to access this page.</div>
      </div>
    )
  }

  return <>{children}</>
}
