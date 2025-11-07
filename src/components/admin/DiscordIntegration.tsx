"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Unlink, Link } from "lucide-react"

interface DiscordAccount {
  id: string
  discord_id: string
  discord_username: string
}

export function DiscordIntegration() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [discordAccount, setDiscordAccount] = useState<DiscordAccount | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDiscordAccount()
  }, [user])

  const loadDiscordAccount = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("discord_accounts").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      setDiscordAccount(data || null)
    } catch (error) {
      console.error("Error loading Discord account:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDiscordLink = () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/discord/callback`
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`

    window.location.href = discordAuthUrl
  }

  const handleDiscordUnlink = async () => {
    if (!discordAccount) return

    try {
      const { error } = await supabase.from("discord_accounts").delete().eq("id", discordAccount.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Discord account unlinked",
      })

      setDiscordAccount(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unlink Discord account",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discord Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {discordAccount ? (
          <>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{discordAccount.discord_username}</p>
                <Badge variant="default">{discordAccount.discord_id}</Badge>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDiscordUnlink}>
                <Unlink className="w-4 h-4 mr-2" />
                Unlink
              </Button>
            </div>
          </>
        ) : (
          <Button onClick={handleDiscordLink} className="w-full">
            <Link className="w-4 h-4 mr-2" />
            Link Discord Account
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
