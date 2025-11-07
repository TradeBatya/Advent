/**
 * Script to promote a user to admin
 * Usage: Pass the user email as an argument
 *
 * Example:
 * ts-node scripts/create_admin_user.ts admin@example.com
 */

import { createServerClient } from "../src/lib/supabase/server"

async function promoteToAdmin(userEmail: string) {
  const supabase = createServerClient()

  try {
    console.log(`Promoting user ${userEmail} to admin...`)

    // Get the user by email
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(userEmail)

    if (userError || !user) {
      console.error("User not found:", userEmail)
      return
    }

    console.log(`Found user: ${user.id}`)

    // Get admin role ID
    const { data: adminRole, error: roleError } = await supabase.from("roles").select("id").eq("name", "admin").single()

    if (roleError || !adminRole) {
      console.error("Admin role not found")
      return
    }

    // Assign admin role
    const { error: assignError } = await supabase.from("user_roles").insert({
      user_id: user.id,
      role_id: adminRole.id,
    })

    if (assignError && !assignError.message.includes("duplicate")) {
      console.error("Error assigning role:", assignError)
      return
    }

    console.log(`✓ User ${userEmail} is now an admin`)
  } catch (error) {
    console.error("Error:", error)
  }
}

const userEmail = process.argv[2]
if (!userEmail) {
  console.error("Please provide a user email as an argument")
  process.exit(1)
}

promoteToAdmin(userEmail)
