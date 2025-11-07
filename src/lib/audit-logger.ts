import { createClient } from "./supabase/client"

export interface AuditLogEntry {
  user_id: string
  action: string
  table_name: string
  record_id: string
  changes: Record<string, any>
}

export async function logAuditEntry(entry: AuditLogEntry): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("audit_logs").insert([
    {
      user_id: entry.user_id,
      action: entry.action,
      table_name: entry.table_name,
      record_id: entry.record_id,
      changes: entry.changes,
    },
  ])

  if (error) {
    console.error("Error logging audit entry:", error)
  }
}

export async function getAuditLogs(userId?: string, limit = 100): Promise<AuditLogEntry[]> {
  const supabase = createClient()

  let query = supabase.from("audit_logs").select("*").order("created_at", {
    ascending: false,
  })

  if (userId) {
    query = query.eq("user_id", userId)
  }

  query = query.limit(limit)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching audit logs:", error)
    return []
  }

  return data || []
}
