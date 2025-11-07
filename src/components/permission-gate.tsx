import type React from "react"
import { useHasPermission } from "../hooks/use-rbac"
import type { Permission } from "../lib/rbac"

interface PermissionGateProps {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission, loading } = useHasPermission(permission)

  if (loading) {
    return null
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
