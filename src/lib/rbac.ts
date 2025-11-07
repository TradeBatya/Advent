import { createClient } from "./supabase/client"

export type Permission =
  | "manage_users"
  | "manage_corporations"
  | "manage_roles"
  | "view_audit_logs"
  | "discord_integration"
  | "view_corporations"
  | "link_character"

export type Role = "admin" | "moderator" | "member"

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "manage_users",
    "manage_corporations",
    "manage_roles",
    "view_audit_logs",
    "discord_integration",
    "view_corporations",
    "link_character",
  ],
  moderator: ["manage_users", "discord_integration", "view_corporations", "link_character"],
  member: ["view_corporations", "link_character"],
}

export async function getUserRole(userId: string): Promise<Role> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("user_roles").select("roles (name)").eq("user_id", userId).single()

    if (error || !data) {
      return "member" // Default role
    }

    return (data as any)?.roles?.name || "member"
  } catch {
    return "member"
  }
}

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const role = await getUserRole(userId)
  return rolePermissions[role] || []
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false
}

export async function userHasPermission(userId: string, permission: Permission): Promise<boolean> {
  const role = await getUserRole(userId)
  return hasPermission(role, permission)
}

export async function requirePermission(userId: string, permission: Permission): Promise<boolean> {
  const hasAccess = await userHasPermission(userId, permission)
  if (!hasAccess) {
    throw new Error(`User does not have permission: ${permission}`)
  }
  return true
}

export function canAccessAdminPanel(role: Role): boolean {
  return role === "admin" || role === "moderator"
}

export function canManageUser(role: Role): boolean {
  return hasPermission(role, "manage_users")
}

export function canManageCorporations(role: Role): boolean {
  return hasPermission(role, "manage_corporations")
}

export function canViewAuditLogs(role: Role): boolean {
  return hasPermission(role, "view_audit_logs")
}

export function canLinkCharacter(role: Role): boolean {
  return hasPermission(role, "link_character")
}
