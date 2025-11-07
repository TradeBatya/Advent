import { supabase } from "@/integrations/supabase/client"

export type Permission =
  | "create_user"
  | "edit_user"
  | "delete_user"
  | "assign_role"
  | "create_news"
  | "edit_news"
  | "delete_news"
  | "create_operation"
  | "edit_operation"
  | "delete_operation"
  | "create_intel"
  | "edit_intel"
  | "delete_intel"
  | "view_intel"
  | "link_discord"
  | "unlink_discord"
  | "manage_plugins"
  | "manage_roles"
  | "view_logs"
  | "all"

export interface PermissionSet {
  [key: string]: boolean
}

export async function getUserPermissions(userId: string): Promise<PermissionSet> {
  try {
    const { data, error } = await supabase.from("user_roles").select("roles(permissions)").eq("user_id", userId)

    if (error) throw error

    const permissions: PermissionSet = {}

    if (data) {
      for (const item of data) {
        const rolePermissions = (item.roles as any)?.permissions || {}
        Object.assign(permissions, rolePermissions)
      }
    }

    return permissions
  } catch (error) {
    console.error("[v0] Error fetching permissions:", error)
    return {}
  }
}

export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId)
    return permissions[permission] === true || permissions["all"] === true
  } catch (error) {
    console.error("[v0] Permission check failed:", error)
    return false
  }
}

export async function getPluginPermissions(roleName: string, pluginId: string): Promise<Permission[]> {
  try {
    const { data, error } = await supabase
      .from("role_plugins")
      .select("permissions")
      .eq("role_name", roleName)
      .eq("plugin_id", pluginId)
      .single()

    if (error) throw error
    return data?.permissions || []
  } catch (error) {
    console.error("[v0] Error fetching plugin permissions:", error)
    return []
  }
}

export async function assignPermissionsToRole(
  roleName: string,
  pluginId: string,
  permissions: Permission[],
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("role_plugins")
      .update({ permissions })
      .eq("role_name", roleName)
      .eq("plugin_id", pluginId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] Error assigning permissions:", error)
    return false
  }
}
