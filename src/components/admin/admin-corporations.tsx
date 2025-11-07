"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { CorporationDialog } from "./corporation-dialog"

interface CorporationData {
  id: string
  eve_corp_id: number
  name: string
  ticker: string
  alliance_id: number | null
  created_at: string
}

export default function AdminCorporations() {
  const [corporations, setCorporations] = useState<CorporationData[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const supabase = createClient()

  const fetchCorporations = async () => {
    try {
      const { data, error } = await supabase.from("corporations").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCorporations(data || [])
    } catch (error) {
      console.error("Error fetching corporations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCorporations()

    const subscription = supabase
      .channel("corporations")
      .on("postgres_changes", { event: "*", schema: "public", table: "corporations" }, () => {
        fetchCorporations()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) {
    return <div className="text-white">Loading corporations...</div>
  }

  return (
    <>
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Corporations</CardTitle>
          <Button onClick={() => setDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            Add Corporation
          </Button>
        </CardHeader>
        <CardContent>
          {corporations.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No corporations registered yet. Add one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Ticker</TableHead>
                  <TableHead className="text-slate-300">EVE Corp ID</TableHead>
                  <TableHead className="text-slate-300">Added</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {corporations.map((corp) => (
                  <TableRow key={corp.id} className="border-slate-700">
                    <TableCell className="text-white">{corp.name}</TableCell>
                    <TableCell className="text-slate-300 font-mono">{corp.ticker}</TableCell>
                    <TableCell className="text-slate-300">{corp.eve_corp_id}</TableCell>
                    <TableCell className="text-slate-400">{new Date(corp.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-400/10">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CorporationDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchCorporations} />
    </>
  )
}
