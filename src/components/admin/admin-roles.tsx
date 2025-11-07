"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"

interface RoleData {
  id: string
  name: string
  description: string
  permissions: Record<string, boolean>
}

export default function AdminRoles() {
  const [roles, setRoles] = useState<RoleData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase.from("roles").select("*").order("name")

        if (error) throw error
        setRoles(data || [])
      } catch (error) {
        console.error("Error fetching roles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("roles")
      .on("postgres_changes", { event: "*", schema: "public", table: "roles" }, () => {
        fetchRoles()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) {
    return <div className="text-white">Loading roles...</div>
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white">Role Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No roles configured yet.</p>
        ) : (
          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.id} className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white capitalize">{role.name}</h3>
                    <p className="text-sm text-slate-400">{role.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(role.permissions || {}).map(([key, value]) => (
                    <Badge
                      key={key}
                      variant={value ? "default" : "outline"}
                      className={value ? "bg-cyan-600 text-white" : "border-slate-600 text-slate-400"}
                    >
                      {key.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
