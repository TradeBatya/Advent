"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

type ChangeHandler<T> = (payload: RealtimePostgresChangesPayload<T>) => void

export function useRealtimeSubscription<T>(
  table: string,
  onChange: ChangeHandler<T>,
  options?: { event?: "*" | "INSERT" | "UPDATE" | "DELETE"; enabled?: boolean },
) {
  const subscriptionRef = useRef<any>(null)
  const event = options?.event || "*"
  const enabled = options?.enabled !== false

  useEffect(() => {
    if (!enabled) return

    console.log(`[v0] Subscribing to ${table} table`)

    subscriptionRef.current = supabase
      .channel(`public:${table}`)
      .on(
        "postgres_changes",
        {
          event: event as any,
          schema: "public",
          table: table,
        },
        onChange,
      )
      .subscribe()

    return () => {
      console.log(`[v0] Unsubscribing from ${table} table`)
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [table, onChange, event, enabled])
}

export function useRealtimeMultiSubscription<T>(
  tables: string[],
  onChange: (table: string, payload: any) => void,
  options?: { enabled?: boolean },
) {
  const subscriptionsRef = useRef<Record<string, any>>({})
  const enabled = options?.enabled !== false

  useEffect(() => {
    if (!enabled) return

    const handleChange = (table: string) => (payload: any) => {
      onChange(table, payload)
    }

    tables.forEach((table) => {
      console.log(`[v0] Subscribing to ${table} table`)

      subscriptionsRef.current[table] = supabase
        .channel(`public:${table}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: table,
          },
          handleChange(table),
        )
        .subscribe()
    })

    return () => {
      tables.forEach((table) => {
        console.log(`[v0] Unsubscribing from ${table} table`)
        if (subscriptionsRef.current[table]) {
          subscriptionsRef.current[table].unsubscribe()
        }
      })
      subscriptionsRef.current = {}
    }
  }, [tables.join(","), onChange, enabled])
}
