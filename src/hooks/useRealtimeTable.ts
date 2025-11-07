"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useRealtimeSubscription } from "./useRealtimeSubscription"

interface UseRealtimeTableOptions {
  table: string
  filters?: { column: string; value: any }[]
  select?: string
  limit?: number
  orderBy?: { column: string; ascending: boolean }
  enabled?: boolean
}

export function useRealtimeTable<T>(options: UseRealtimeTableOptions) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase.from(options.table).select(options.select || "*")

      if (options.filters) {
        options.filters.forEach(({ column, value }) => {
          query = query.eq(column, value)
        })
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending })
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: result, error: err } = await query

      if (err) throw err
      setData(result || [])
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch data")
      setError(error)
      console.error("[v0] Error fetching table data:", error)
    } finally {
      setLoading(false)
    }
  }, [options.table, options.filters, options.select, options.limit, options.orderBy])

  useRealtimeSubscription(
    options.table,
    () => {
      fetchData()
    },
    { enabled: options.enabled !== false },
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
