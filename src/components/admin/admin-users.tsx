"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { UserManagementDialog } from "./user-management-dialog"

interface UserData {
  id: string
  username: string
  full_name: string | null
  created_at: string
  role?: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const supabase = createClient()

  const handleManageClick = (user: UserData) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    fetchUsers()
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          full_name,
          created_at,
          user_roles (
            roles (name)
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formatted = (data || []).map((user: any) => ({
        ...user,
        role: user.user_roles?.[0]?.roles?.name || "member",
      }))

      setUsers(formatted)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()

    const subscription = supabase
      .channel("profiles")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchUsers()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) {
    return <div className="text-white">Loading users...</div>
  }

  return (
    <>
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Users Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Username</TableHead>
                <TableHead className="text-slate-300">Full Name</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">Joined</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-slate-700">
                  <TableCell className="text-white">{user.username}</TableCell>
                  <TableCell className="text-slate-300">{user.full_name || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin"
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : "border-slate-500 bg-slate-500/10 text-slate-300"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cyan-400 hover:bg-cyan-400/10"
                      onClick={() => handleManageClick(user)}
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <UserManagementDialog
          userId={selectedUser.id}
          username={selectedUser.username}
          currentRole={selectedUser.role || "member"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleDialogSuccess}
        />
      )}
    </>
  )
}
