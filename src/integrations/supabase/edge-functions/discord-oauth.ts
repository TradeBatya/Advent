import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  console.log("[v0] Discord OAuth request received:", req.method)

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { action, code, state, userId, discordId } = await req.json()
    console.log("[v0] Discord action:", action)

    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "")

    switch (action) {
      case "link":
        return handleLinkDiscord(supabase, userId, discordId, corsHeaders)
      case "unlink":
        return handleUnlinkDiscord(supabase, userId, corsHeaders)
      case "verify":
        return handleVerifyDiscord(supabase, code, state, corsHeaders)
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }
  } catch (error) {
    console.error("[v0] Error in discord-oauth function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function handleLinkDiscord(supabase: any, userId: string, discordId: string, corsHeaders: any) {
  try {
    console.log("[v0] Linking Discord account:", discordId, "to user:", userId)

    const { data, error } = await supabase
      .from("discord_accounts")
      .upsert({
        user_id: userId,
        discord_id: discordId,
        discord_username: discordId,
      })
      .select()

    if (error) throw error

    // Update profile with Discord info
    await supabase.from("profiles").update({ discord_id: discordId }).eq("id", userId)

    // Log audit event
    await supabase.from("audit_logs").insert({
      action: "discord_linked",
      entity_type: "discord_accounts",
      entity_id: userId,
      new_values: { discord_id: discordId },
    })

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Link Discord error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

async function handleUnlinkDiscord(supabase: any, userId: string, corsHeaders: any) {
  try {
    console.log("[v0] Unlinking Discord account for user:", userId)

    const { error } = await supabase.from("discord_accounts").delete().eq("user_id", userId)

    if (error) throw error

    // Update profile
    await supabase.from("profiles").update({ discord_id: null }).eq("id", userId)

    // Log audit event
    await supabase.from("audit_logs").insert({
      action: "discord_unlinked",
      entity_type: "discord_accounts",
      entity_id: userId,
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Unlink Discord error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

async function handleVerifyDiscord(supabase: any, code: string, state: string, corsHeaders: any) {
  try {
    console.log("[v0] Verifying Discord OAuth code")

    // Note: This is a placeholder. In production, you would exchange the code for a token
    // with Discord's OAuth endpoint

    return new Response(JSON.stringify({ success: true, message: "Discord verification pending" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Verify Discord error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}
