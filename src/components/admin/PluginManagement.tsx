"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Zap } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface Plugin {
  id: string
  name: string
  display_name: string
  description: string
  version: string
  is_enabled: boolean
  permissions: string[]
  config: Record<string, any>
  created_at: string
}

export function PluginManagement() {
  const { toast } = useToast()
  const { language } = useLanguage()
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const t = {
    en: {
      title: "Plugin Management",
      description: "Enable or disable plugins and manage permissions",
      version: "Version",
      permissions: "Permissions",
      status: "Status",
      enabled: "Enabled",
      disabled: "Disabled",
      updated: "Plugin status updated",
    },
    ru: {
      title: "Управление плагинами",
      description: "Включайте, отключайте плагины и управляйте разрешениями",
      version: "Версия",
      permissions: "Разрешения",
      status: "Статус",
      enabled: "Включено",
      disabled: "Отключено",
      updated: "Статус плагина обновлен",
    },
  }[language]

  useEffect(() => {
    loadPlugins()
  }, [])

  const loadPlugins = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("plugins").select("*").order("display_name")

      if (error) throw error
      setPlugins(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePlugin = async (pluginId: string, currentState: boolean) => {
    setUpdating(pluginId)
    try {
      const { error } = await supabase.from("plugins").update({ is_enabled: !currentState }).eq("id", pluginId)

      if (error) throw error

      toast({ title: t.updated })
      await loadPlugins()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {plugins.map((plugin) => (
          <div key={plugin.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-base">{plugin.display_name}</h3>
                <p className="text-sm text-muted-foreground">{plugin.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {t.version}: {plugin.version}
                  </Badge>
                  <Badge variant={plugin.is_enabled ? "default" : "secondary"}>
                    {plugin.is_enabled ? t.enabled : t.disabled}
                  </Badge>
                </div>
              </div>
              <Switch
                checked={plugin.is_enabled}
                onCheckedChange={() => handleTogglePlugin(plugin.id, plugin.is_enabled)}
                disabled={updating === plugin.id}
              />
            </div>

            {plugin.permissions && plugin.permissions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t.permissions}:</p>
                <div className="flex flex-wrap gap-1">
                  {plugin.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
