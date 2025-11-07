"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useRealtimeMultiSubscription } from "./useRealtimeSubscription"

interface Stats {
  totalUsers: number
  totalCorporations: number
  totalCharacters: number
  totalRoles: number
  activeUsers: number
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCorporations: 0,
    totalCharacters: 0,
    totalRoles: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const [profiles, corps, chars, roles] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("corporations").select("*", { count: "exact", head: true }),
        supabase.from("characters").select("*", { count: "exact", head: true }),
        supabase.from("roles").select("*", { count: "exact", head: true }),
      ])

      setStats({
        totalUsers: profiles.count || 0,
        totalCorporations: corps.count || 0,
        totalCharacters: chars.count || 0,
        totalRoles: roles.count || 0,
        activeUsers: Math.min(profiles.count || 0, 5), // Simplified - could be enhanced
      })
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useRealtimeMultiSubscription(["profiles", "corporations", "characters", "roles"], () => fetchStats(), {
    enabled: true,
  })

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading }
}
