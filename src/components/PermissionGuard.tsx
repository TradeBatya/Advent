import type React from "react"
import { usePermissions } from "@/hooks/usePermissions"
import type { Permission } from "@/lib/permissions"

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  mode?: "all" | "any"
  fallback?: React.ReactNode
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  mode = "any",
  fallback = null,
}: PermissionGuardProps) {
  const { can, canAny, canAll, loading } = usePermissions()

  if (loading) {
    return <>{fallback}</>
  }

  let hasAccess = false

  if (permission) {
    hasAccess = can(permission)
  } else if (permissions) {
    hasAccess = mode === "all" ? canAll(permissions) : canAny(permissions)
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
