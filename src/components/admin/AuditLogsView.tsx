"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Activity, CheckCircle, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"

interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  status: string
  user_id: string
  created_at: string
  error_message?: string
}

export function AuditLogsView() {
  const { toast } = useToast()
  const { language } = useLanguage()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const logsPerPage = 20

  const t = {
    en: {
      title: "Activity Logs",
      description: "System activity and audit trail",
      action: "Action",
      entity: "Entity",
      status: "Status",
      time: "Time",
      success: "Success",
      failed: "Failed",
      pending: "Pending",
      noLogs: "No logs available",
      loadMore: "Load More",
    },
    ru: {
      title: "Логи активности",
      description: "Системная активность и лог аудита",
      action: "Действие",
      entity: "Сущность",
      status: "Статус",
      time: "Время",
      success: "Успешно",
      failed: "Ошибка",
      pending: "В ожидании",
      noLogs: "Нет логов",
      loadMore: "Загрузить ещё",
    },
  }[language]

  useEffect(() => {
    loadLogs()
  }, [page])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range((page - 1) * logsPerPage, page * logsPerPage - 1)

      if (error) throw error
      setLogs(data || [])
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />
    }
  }

  if (loading && page === 1) {
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
          <Activity className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t.noLogs}</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(log.status)}
                  <div className="flex-1">
                    <p className="font-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.entity_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={log.status === "success" ? "default" : "destructive"} className="mb-1">
                    {log.status === "success" ? t.success : log.status === "failed" ? t.failed : t.pending}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {logs.length >= logsPerPage && (
          <Button
            variant="outline"
            className="w-full mt-4 bg-transparent"
            onClick={() => setPage(page + 1)}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t.loadMore}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
