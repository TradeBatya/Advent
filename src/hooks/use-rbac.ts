"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../lib/auth-context"
import { getUserRole, getUserPermissions, userHasPermission, type Role, type Permission } from "../lib/rbac"

export function useRole() {
  const { user } = useAuth()
  const [role, setRole] = useState<Role>("member")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole("member")
        setLoading(false)
        return
      }

      try {
        const userRole = await getUserRole(user.id)
        setRole(userRole)
      } catch (error) {
        console.error("Error fetching user role:", error)
        setRole("member")
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [user])

  return { role, loading }
}

export function usePermissions() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions([])
        setLoading(false)
        return
      }

      try {
        const userPermissions = await getUserPermissions(user.id)
        setPermissions(userPermissions)
      } catch (error) {
        console.error("Error fetching permissions:", error)
        setPermissions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [user])

  return { permissions, loading }
}

export function useHasPermission(permission: Permission) {
  const { user } = useAuth()
  const [hasPermission, setHasPermission] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPermission = async () => {
      if (!user) {
        setHasPermission(false)
        setLoading(false)
        return
      }

      try {
        const result = await userHasPermission(user.id, permission)
        setHasPermission(result)
      } catch (error) {
        console.error("Error checking permission:", error)
        setHasPermission(false)
      } finally {
        setLoading(false)
      }
    }

    checkPermission()
  }, [user, permission])

  return { hasPermission, loading }
}
