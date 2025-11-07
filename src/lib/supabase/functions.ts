import { createClient } from "./client"

export async function updateUserRole(userId: string, roleName: string) {
  const supabase = createClient()

  // First, get all role IDs we need
  const { data: roles, error: rolesError } = await supabase.from("roles").select("id, name")

  if (rolesError) throw rolesError

  // Find the target role
  const targetRole = roles?.find((r) => r.name === roleName)
  if (!targetRole) throw new Error("Role not found")

  // Delete all current roles for this user
  const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", userId)

  if (deleteError) throw deleteError

  // Add the new role
  const { error: insertError } = await supabase.from("user_roles").insert({
    user_id: userId,
    role_id: targetRole.id,
  })

  if (insertError) throw insertError
}

export async function getCharactersForCorporation(corpId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("characters")
    .select(`
      id,
      eve_character_id,
      name,
      user_id,
      profiles (
        username,
        full_name
      )
    `)
    .eq("corporation_id", corpId)

  if (error) throw error
  return data
}

export async function linkCharacterToCorporation(characterId: string, corporationId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("characters").update({ corporation_id: corporationId }).eq("id", characterId)

  if (error) throw error
}

export async function getAdminUserRole(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_roles").select("roles (name)").eq("user_id", userId).single()

  if (error) return null
  return (data as any)?.roles?.name
}
