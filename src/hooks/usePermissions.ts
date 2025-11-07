"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { type Permission, getUserPermissions, type PermissionSet } from "@/lib/permissions"

export function usePermissions() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<PermissionSet>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.id) {
        setPermissions({})
        setLoading(false)
        return
      }

      try {
        const userPerms = await getUserPermissions(user.id)
        setPermissions(userPerms)
      } catch (error) {
        console.error("[v0] Error loading permissions:", error)
        setPermissions({})
      } finally {
        setLoading(false)
      }
    }

    loadPermissions()
  }, [user?.id])

  const can = (permission: Permission): boolean => {
    return permissions[permission] === true || permissions["all"] === true
  }

  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some((p) => can(p))
  }

  const canAll = (perms: Permission[]): boolean => {
    return perms.every((p) => can(p))
  }

  return {
    permissions,
    loading,
    can,
    canAny,
    canAll,
  }
}

export function useHasPermission(permission: Permission) {
  const { permissions, loading } = usePermissions()
  return !loading && (permissions[permission] === true || permissions["all"] === true)
}
