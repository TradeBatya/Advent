"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Building2, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Corporation {
  id: string
  name: string
  ticker: string
  eve_corp_id: string
  alliance_name: string
  ceo_id: string
  member_count?: number
  created_at: string
}

export function CorporationManagementView() {
  const { toast } = useToast()
  const { language } = useLanguage()
  const [corporations, setCorporations] = useState<Corporation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    eve_corp_id: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const t = {
    en: {
      title: "Corporation Management",
      description: "Manage EVE Online corporations",
      addCorp: "Add Corporation",
      name: "Corporation Name",
      ticker: "Ticker",
      corpId: "EVE Corp ID",
      alliance: "Alliance",
      created: "Created",
      actions: "Actions",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      added: "Corporation added",
      deleted: "Corporation deleted",
      noCorp: "No corporations found",
      required: "This field is required",
    },
    ru: {
      title: "Управление корпорациями",
      description: "Управление корпорациями EVE Online",
      addCorp: "Добавить корпорацию",
      name: "Название корпорации",
      ticker: "Тикер",
      corpId: "EVE ID корпорации",
      alliance: "Альянс",
      created: "Создана",
      actions: "Действия",
      delete: "Удалить",
      save: "Сохранить",
      cancel: "Отмена",
      added: "Корпорация добавлена",
      deleted: "Корпорация удалена",
      noCorp: "Корпорации не найдены",
      required: "Это поле обязательно",
    },
  }[language]

  useEffect(() => {
    loadCorporations()
  }, [])

  const loadCorporations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("corporations").select("*").order("name")

      if (error) throw error
      setCorporations(data || [])
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

  const handleAddCorporation = async () => {
    if (!formData.name || !formData.ticker || !formData.eve_corp_id) {
      toast({
        title: "Validation Error",
        description: t.required,
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from("corporations").insert([formData])
      if (error) throw error

      toast({ title: t.added })
      setFormData({ name: "", ticker: "", eve_corp_id: "" })
      setIsDialogOpen(false)
      await loadCorporations()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCorporation = async (corpId: string) => {
    if (!confirm(t.delete)) return

    setDeleting(corpId)
    try {
      const { error } = await supabase.from("corporations").delete().eq("id", corpId)
      if (error) throw error

      toast({ title: t.deleted })
      await loadCorporations()
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t.addCorp}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.addCorp}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t.name}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="EVE Corporation"
                />
              </div>
              <div>
                <Label>{t.ticker}</Label>
                <Input
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                  placeholder="TICKER"
                  maxLength={10}
                />
              </div>
              <div>
                <Label>{t.corpId}</Label>
                <Input
                  value={formData.eve_corp_id}
                  onChange={(e) => setFormData({ ...formData, eve_corp_id: e.target.value })}
                  placeholder="98123456"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleAddCorporation} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {corporations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t.noCorp}</p>
        ) : (
          <div className="grid gap-4">
            {corporations.map((corp) => (
              <div key={corp.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{corp.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    [{corp.ticker}] {corp.alliance_name && `• ${corp.alliance_name}`}
                  </p>
                  <p className="text-xs text-muted-foreground">ID: {corp.eve_corp_id}</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteCorporation(corp.id)}
                  disabled={deleting === corp.id}
                >
                  {deleting === corp.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
