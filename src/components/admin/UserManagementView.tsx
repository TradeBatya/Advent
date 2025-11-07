"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Users, Search, Trash2 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  display_name: string
  discord_username: string
  eve_character_name: string
  created_at: string
  roles: Array<{ role_name: string }>
}

export function UserManagementView() {
  const { toast } = useToast()
  const { language } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  const t = {
    en: {
      title: "User Management",
      description: "Manage portal users and their access",
      search: "Search users...",
      name: "Name",
      discord: "Discord",
      character: "Character",
      joined: "Joined",
      roles: "Roles",
      actions: "Actions",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this user?",
      deleted: "User deleted",
      noUsers: "No users found",
      details: "User Details",
    },
    ru: {
      title: "Управление пользователями",
      description: "Управление пользователями портала и их доступом",
      search: "Поиск пользователей...",
      name: "Имя",
      discord: "Discord",
      character: "Персонаж",
      joined: "Присоединился",
      roles: "Роли",
      actions: "Действия",
      delete: "Удалить",
      deleteConfirm: "Вы уверены, что хотите удалить этого пользователя?",
      deleted: "Пользователь удален",
      noUsers: "Пользователи не найдены",
      details: "Информация о пользователе",
    },
  }[language]

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role_name)")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t.deleteConfirm)) return

    setDeleting(userId)
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId)
      if (error) throw error

      toast({ title: t.deleted })
      await loadUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.discord_username?.toLowerCase().includes(search.toLowerCase()) ||
      user.eve_character_name?.toLowerCase().includes(search.toLowerCase()),
  )

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
          <Users className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t.noUsers}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t.name}</th>
                  <th className="text-left p-2">{t.discord}</th>
                  <th className="text-left p-2">{t.character}</th>
                  <th className="text-left p-2">{t.roles}</th>
                  <th className="text-left p-2">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{user.display_name || "Unknown"}</td>
                    <td className="p-2">{user.discord_username || "-"}</td>
                    <td className="p-2">{user.eve_character_name || "-"}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((r) => (
                          <Badge key={r.role_name} variant="outline" className="text-xs">
                            {r.role_name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t.details}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>{t.name}</Label>
                              <p className="text-sm font-medium">{user.display_name}</p>
                            </div>
                            <div>
                              <Label>{t.discord}</Label>
                              <p className="text-sm font-medium">{user.discord_username || "-"}</p>
                            </div>
                            <div>
                              <Label>{t.character}</Label>
                              <p className="text-sm font-medium">{user.eve_character_name || "-"}</p>
                            </div>
                            <div>
                              <Label>{t.joined}</Label>
                              <p className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleting === user.id}
                      >
                        {deleting === user.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
