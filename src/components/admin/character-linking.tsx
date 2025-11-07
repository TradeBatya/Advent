"use client"

import { useState } from "react"
import { supabase } from "../../integrations/supabase/client"
import { fetchEveCorporation } from "../../lib/eve-api"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { useToast } from "../../hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { CharacterSearch, type CharacterSearchResult } from "./CharacterSearch"

interface CharacterLinkingProps {
  userId: string
  onSuccess: () => void
}

export function CharacterLinking({ userId, onSuccess }: CharacterLinkingProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterSearchResult | null>(null)
  const [isLinking, setIsLinking] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()

  const handleSelectCharacter = (character: CharacterSearchResult) => {
    setSelectedCharacter(character)
    setShowDialog(true)
  }

  const handleLinkCharacter = async () => {
    if (!selectedCharacter) return

    setIsLinking(true)

    try {
      let corporationId = selectedCharacter.id.toString()

      const { data: existingCorp } = await supabase
        .from("corporations")
        .select("id")
        .eq("eve_corp_id", selectedCharacter.corporation_id)
        .single()

      if (existingCorp) {
        corporationId = existingCorp.id
      } else {
        // Fetch corporation details for better data
        try {
          const corpData = await fetchEveCorporation(selectedCharacter.corporation_id)
          const { data: newCorp, error: corpError } = await supabase
            .from("corporations")
            .insert({
              eve_corp_id: corpData.corporation_id,
              name: corpData.corporation_name,
              ticker: corpData.ticker,
              alliance_id: corpData.alliance_id,
            })
            .select()
            .single()

          if (corpError) throw corpError
          corporationId = newCorp.id
        } catch (error) {
          console.error("[v0] Failed to create corporation, using fallback", error)
          const { data: newCorp, error: corpError } = await supabase
            .from("corporations")
            .insert({
              eve_corp_id: selectedCharacter.corporation_id,
              name: `Corporation ${selectedCharacter.corporation_id}`,
              ticker: "N/A",
            })
            .select()
            .single()

          if (corpError) throw corpError
          corporationId = newCorp.id
        }
      }

      const { error: charError } = await supabase.from("characters").insert({
        user_id: userId,
        eve_character_id: selectedCharacter.id,
        name: selectedCharacter.name,
        corporation_id: corporationId,
      })

      if (charError) throw charError

      await supabase.from("audit_logs").insert({
        user_id: userId,
        action: "CHARACTER_LINKED",
        table_name: "characters",
        timestamp: new Date().toISOString(),
        details: {
          character_id: selectedCharacter.id,
          character_name: selectedCharacter.name,
        },
      })

      toast({
        title: "Success",
        description: `Character ${selectedCharacter.name} linked successfully`,
      })

      onSuccess()
      setShowDialog(false)
      setSelectedCharacter(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to link character",
        variant: "destructive",
      })
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <>
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Link EVE Character</CardTitle>
        </CardHeader>
        <CardContent>
          <CharacterSearch onSelect={handleSelectCharacter} />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="border-slate-700 bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Character Link</DialogTitle>
          </DialogHeader>

          {selectedCharacter && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCharacter.portrait_url || "/placeholder.svg"}
                  alt={selectedCharacter.name}
                  className="w-16 h-16 rounded border border-slate-600"
                />
                <div>
                  <p className="text-white font-medium">{selectedCharacter.name}</p>
                  <p className="text-sm text-slate-400">
                    Security Status: {selectedCharacter.security_status.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-300">This will associate your EVE character with your portal account.</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-slate-600">
              Cancel
            </Button>
            <Button onClick={handleLinkCharacter} disabled={isLinking} className="bg-cyan-600 hover:bg-cyan-700">
              {isLinking ? "Linking..." : "Link Character"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
