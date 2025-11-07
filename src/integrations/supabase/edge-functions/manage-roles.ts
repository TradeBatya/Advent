import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declaring Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  console.log("[v0] Edge Function request received:", req.method)

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { action, userId, roleName, roleData } = await req.json()
    console.log("[v0] Action:", action)

    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "")

    switch (action) {
      case "grant":
        return handleGrantRole(supabase, userId, roleName, corsHeaders)
      case "revoke":
        return handleRevokeRole(supabase, userId, roleName, corsHeaders)
      case "list_users":
        return handleListUsers(supabase, corsHeaders)
      case "create_role":
        return handleCreateRole(supabase, roleData, corsHeaders)
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }
  } catch (error) {
    console.error("[v0] Error in edge function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function handleGrantRole(supabase: any, userId: string, roleName: string, corsHeaders: any) {
  try {
    console.log("[v0] Granting role:", roleName, "to user:", userId)

    const { data, error } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role_name: roleName,
      })
      .select()

    if (error) throw error

    // Log audit event
    await supabase.from("audit_logs").insert({
      action: "role_granted",
      entity_type: "user_roles",
      entity_id: userId,
      new_values: { role_name: roleName },
    })

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Grant role error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

async function handleRevokeRole(supabase: any, userId: string, roleName: string, corsHeaders: any) {
  try {
    console.log("[v0] Revoking role:", roleName, "from user:", userId)

    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role_name", roleName)

    if (error) throw error

    // Log audit event
    await supabase.from("audit_logs").insert({
      action: "role_revoked",
      entity_type: "user_roles",
      entity_id: userId,
      old_values: { role_name: roleName },
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Revoke role error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

async function handleListUsers(supabase: any, corsHeaders: any) {
  try {
    console.log("[v0] Listing users with roles")

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        display_name,
        discord_username,
        eve_character_name,
        created_at,
        user_roles (
          role_id: role_name,
          role_name,
          granted_at,
          expires_at
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify({ users: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] List users error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

async function handleCreateRole(supabase: any, roleData: any, corsHeaders: any) {
  try {
    console.log("[v0] Creating new role:", roleData.name)

    const { data, error } = await supabase.from("roles").insert(roleData).select()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Create role error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}
