// Script to seed initial roles
import { createServerClient } from "../src/lib/supabase/server"

const roles = [
  {
    name: "admin",
    description: "Full system access",
    permissions: {
      manage_users: true,
      manage_corporations: true,
      manage_roles: true,
      view_audit_logs: true,
      discord_integration: true,
    },
  },
  {
    name: "moderator",
    description: "Moderate users and content",
    permissions: {
      manage_users: true,
      discord_integration: true,
    },
  },
  {
    name: "member",
    description: "Standard member",
    permissions: {
      view_corporations: true,
      link_character: true,
    },
  },
]

async function seedRoles() {
  const supabase = createServerClient()

  for (const role of roles) {
    const { error } = await supabase.from("roles").insert([role]).select()

    if (error && !error.message.includes("duplicate")) {
      console.error(`Error seeding role ${role.name}:`, error)
    } else {
      console.log(`Seeded role: ${role.name}`)
    }
  }
}

seedRoles()
