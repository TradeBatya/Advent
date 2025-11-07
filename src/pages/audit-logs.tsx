"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { useNavigate } from "react-router-dom"
import { ProtectedRoute } from "../components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { getAuditLogs } from "../lib/audit-logger"
import { Button } from "../components/ui/button"
import { LogOut } from "lucide-react"

interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  changes: Record<string, any>
  created_at: string
}

export default function AuditLogsPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const auditLogs = await getAuditLogs()
        setLogs(auditLogs as AuditLog[])
      } catch (error) {
        console.error("Error fetching audit logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate("/auth/login")
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
              <p className="text-sm text-slate-400">Track all system activities</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">System Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-slate-400">Loading...</div>
              ) : logs.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No audit logs available yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Time</TableHead>
                      <TableHead className="text-slate-300">Action</TableHead>
                      <TableHead className="text-slate-300">Table</TableHead>
                      <TableHead className="text-slate-300">Record ID</TableHead>
                      <TableHead className="text-slate-300">Changes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-slate-700">
                        <TableCell className="text-slate-300 text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white">{log.action}</TableCell>
                        <TableCell className="text-slate-300">{log.table_name}</TableCell>
                        <TableCell className="text-slate-300 font-mono text-sm">{log.record_id}</TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {JSON.stringify(log.changes).substring(0, 50)}...
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
