"use client"

import { useState } from "react"
import { createClient } from "../../lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useToast } from "../../hooks/use-toast"

interface CorporationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CorporationDialog({ open, onOpenChange, onSuccess }: CorporationDialogProps) {
  const [corpName, setCorpName] = useState("")
  const [ticker, setTicker] = useState("")
  const [eveCorpId, setEveCorpId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!corpName || !ticker || !eveCorpId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("corporations").insert({
        name: corpName,
        ticker: ticker.toUpperCase(),
        eve_corp_id: Number.parseInt(eveCorpId),
      })

      if (error) throw error

      toast({
        title: "Success",
        description: `Corporation ${corpName} added`,
      })

      setCorpName("")
      setTicker("")
      setEveCorpId("")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add corporation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add Corporation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="corpName" className="text-slate-200">
              Corporation Name
            </Label>
            <Input
              id="corpName"
              value={corpName}
              onChange={(e) => setCorpName(e.target.value)}
              placeholder="e.g., Northern Coalition"
              className="border-slate-600 bg-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticker" className="text-slate-200">
              Ticker
            </Label>
            <Input
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g., NC"
              maxLength={5}
              className="border-slate-600 bg-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eveCorpId" className="text-slate-200">
              EVE Corporation ID
            </Label>
            <Input
              id="eveCorpId"
              value={eveCorpId}
              onChange={(e) => setEveCorpId(e.target.value)}
              placeholder="e.g., 98765432"
              className="border-slate-600 bg-slate-700 text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700">
            {isLoading ? "Adding..." : "Add Corporation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
