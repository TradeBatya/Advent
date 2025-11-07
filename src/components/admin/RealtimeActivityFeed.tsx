"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useRealtimeSubscription } from "../../hooks/useRealtimeSubscription"
import { format } from "date-fns"
import { CheckCircle, Trash2, Lock, Unlock } from "lucide-react"
import { Activity } from "lucide-react" // Declared the Activity variable

interface ActivityItem {
  id: string
  user_id: string
  action: string
  table_name: string
  timestamp: string
  details: Record<string, any>
}

export function RealtimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useRealtimeSubscription(
    "audit_logs",
    (payload) => {
      if (payload.eventType === "INSERT") {
        const newActivity = payload.new as ActivityItem
        setActivities((prev) => [newActivity, ...prev].slice(0, 20))
      }
    },
    { event: "INSERT" },
  )

  const getActionIcon = (action: string) => {
    if (action.includes("DELETED")) return <Trash2 className="h-4 w-4 text-red-400" />
    if (action.includes("GRANTED")) return <Unlock className="h-4 w-4 text-green-400" />
    if (action.includes("REVOKED")) return <Lock className="h-4 w-4 text-yellow-400" />
    return <CheckCircle className="h-4 w-4 text-cyan-400" />
  }

  const getActionLabel = (action: string) => {
    return action.replace(/_/g, " ").toLowerCase()
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-400" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-slate-400 text-sm">No activity yet</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 rounded border border-slate-700 hover:bg-slate-700/50 transition"
              >
                <div className="pt-1">{getActionIcon(activity.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium capitalize">{getActionLabel(activity.action)}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {activity.table_name}
                    {activity.details?.role_id && ` - Role: ${activity.details.role_id}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{format(new Date(activity.timestamp), "HH:mm:ss")}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
