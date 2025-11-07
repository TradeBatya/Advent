import { supabase } from "@/integrations/supabase/client"

export interface UserUpdate {
  id: string
  username: string
  email: string
  role: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  table_name: string
  timestamp: string
  details: Record<string, any>
}

export async function fetchRecentActivity(limit = 50): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching activity logs:", error)
    return []
  }
}

export async function fetchUsersWithRoles(limit = 100) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, created_at, user_roles(roles(name))")
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return []
  }
}

export async function fetchCorporations(limit = 100) {
  try {
    const { data, error } = await supabase.from("corporations").select("*").limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching corporations:", error)
    return []
  }
}

export async function updateUserRole(userId: string, roleId: string, grantAccess: boolean) {
  try {
    if (grantAccess) {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role_id: roleId,
      })
      if (error) throw error
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role_id", roleId)
      if (error) throw error
    }

    // Log the action
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action: grantAccess ? "ROLE_GRANTED" : "ROLE_REVOKED",
      table_name: "user_roles",
      timestamp: new Date().toISOString(),
      details: { role_id: roleId, granted: grantAccess },
    })

    return true
  } catch (error) {
    console.error("[v0] Error updating user role:", error)
    return false
  }
}

export async function deleteUser(userId: string) {
  try {
    // Delete user data first
    const { error: charError } = await supabase.from("characters").delete().eq("user_id", userId)
    if (charError) throw charError

    const { error: rolesError } = await supabase.from("user_roles").delete().eq("user_id", userId)
    if (rolesError) throw rolesError

    // Log the action
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action: "USER_DELETED",
      table_name: "profiles",
      timestamp: new Date().toISOString(),
      details: { deleted_user_id: userId },
    })

    return true
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    return false
  }
}

export async function createCorporation(data: {
  name: string
  ticker: string
  eve_corp_id: number
  alliance_id?: number
}) {
  try {
    const { data: newCorp, error } = await supabase.from("corporations").insert([data]).select().single()

    if (error) throw error

    // Log the action
    await supabase.from("audit_logs").insert({
      action: "CORPORATION_CREATED",
      table_name: "corporations",
      timestamp: new Date().toISOString(),
      details: { corporation_id: newCorp.id },
    })

    return newCorp
  } catch (error) {
    console.error("[v0] Error creating corporation:", error)
    return null
  }
}

export async function subscribeToUserUpdates(callback: (user: UserUpdate) => void) {
  const subscription = supabase
    .channel("users_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "profiles",
      },
      (payload) => {
        callback(payload.new as UserUpdate)
      },
    )
    .subscribe()

  return () => subscription.unsubscribe()
}

export async function subscribeToActivityUpdates(callback: (activity: ActivityLog) => void) {
  const subscription = supabase
    .channel("activity_changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "audit_logs",
      },
      (payload) => {
        callback(payload.new as ActivityLog)
      },
    )
    .subscribe()

  return () => subscription.unsubscribe()
}
