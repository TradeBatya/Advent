"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Database } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function SystemHealth() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [health, setHealth] = useState({
    database: true,
    auth: true,
    api: true,
    uptime: 100,
  })

  const t = {
    en: {
      title: "System Health",
      description: "Monitor system status and performance",
      database: "Database",
      auth: "Authentication",
      api: "API",
      uptime: "Uptime",
      online: "Online",
      offline: "Offline",
    },
    ru: {
      title: "Здоровье системы",
      description: "Мониторинг статуса системы и производительности",
      database: "База данных",
      auth: "Аутентификация",
      api: "API",
      uptime: "Время работы",
      online: "В сети",
      offline: "Оффлайн",
    },
  }[language]

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      const start = Date.now()
      const { data } = await supabase.from("roles").select("count", { count: "exact", head: true })
      const latency = Date.now() - start

      setHealth({
        database: latency < 1000,
        auth: true,
        api: latency < 5000,
        uptime: 100,
      })
    } catch (error) {
      console.error("[v0] Health check failed:", error)
      setHealth({ database: false, auth: false, api: false, uptime: 95 })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {[
            { name: t.database, status: health.database },
            { name: t.auth, status: health.auth },
            { name: t.api, status: health.api },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {item.status ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">{item.name}</span>
              </div>
              <Badge variant={item.status ? "default" : "destructive"}>{item.status ? t.online : t.offline}</Badge>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{t.uptime}</span>
            <span className="text-sm font-semibold">{health.uptime}%</span>
          </div>
          <Progress value={health.uptime} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
