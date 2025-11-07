"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../lib/auth-context"
import { createClient } from "../../lib/supabase/client"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Users, Building2, Shield, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AdminUsers from "../../components/admin/admin-users"
import AdminCorporations from "../../components/admin/admin-corporations"
import AdminRoles from "../../components/admin/admin-roles"
import AdminStats from "../../components/admin/admin-stats"

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const supabase = createClient()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate("/auth/login")
        return
      }

      try {
        const { data, error } = await supabase.from("user_roles").select("roles (name)").eq("user_id", user.id).single()

        if (error || !data) {
          console.error("Not an admin")
          navigate("/")
          return
        }

        setUserRole((data as any).roles?.name)
      } catch (err) {
        console.error("Error checking admin access:", err)
        navigate("/")
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [user, navigate, supabase])

  const handleSignOut = async () => {
    await signOut()
    navigate("/auth/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (userRole !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="text-red-400">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">EVE Portal Admin</h1>
            <p className="text-sm text-slate-400">Manage your alliance portal</p>
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
        {/* Stats Overview */}
        <AdminStats />

        {/* Tabs */}
        <Tabs defaultValue="users" className="mt-8">
          <TabsList className="bg-slate-800 border-b border-slate-700">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="corporations" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Corporations
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="corporations" className="mt-6">
            <AdminCorporations />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <AdminRoles />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
