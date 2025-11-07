"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { searchEveEntity, fetchEveCharacter, fetchCharacterPortrait } from "../../lib/eve-api"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useToast } from "../../hooks/use-toast"
import { Loader2, Search } from "lucide-react"

export interface CharacterSearchResult {
  id: number
  name: string
  corporation_id: number
  alliance_id: number
  security_status: number
  portrait_url: string
}

interface Props {
  onSelect?: (character: CharacterSearchResult) => void
}

export function CharacterSearch({ onSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<CharacterSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { toast } = useToast()

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!searchQuery.trim()) {
        toast({
          title: "Error",
          description: "Enter a character name",
          variant: "destructive",
        })
        return
      }

      setLoading(true)

      try {
        const searchResults = await searchEveEntity(searchQuery)

        if (!searchResults.character || searchResults.character.length === 0) {
          toast({
            title: "Not found",
            description: "No characters found with that name",
            variant: "destructive",
          })
          setResults([])
          return
        }

        // Fetch full character data for each result
        const characterPromises = searchResults.character.map(async (charId) => {
          try {
            const charData = await fetchEveCharacter(charId)
            const portraitData = await fetchCharacterPortrait(charId)

            return {
              id: charData.character_id,
              name: charData.character_name,
              corporation_id: charData.corporation_id,
              alliance_id: charData.alliance_id,
              security_status: charData.security_status,
              portrait_url: portraitData.px128x128,
            } as CharacterSearchResult
          } catch (error) {
            console.error(`[v0] Error fetching character ${charId}:`, error)
            return null
          }
        })

        const characters = (await Promise.all(characterPromises)).filter((c): c is CharacterSearchResult => c !== null)

        setResults(characters)

        if (characters.length === 0) {
          toast({
            title: "Error",
            description: "Failed to fetch character details",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[v0] Search error:", error)
        toast({
          title: "Error",
          description: "Failed to search characters",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [searchQuery, toast],
  )

  return (
    <div className="space-y-4">
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Search Characters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search character name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-slate-600 bg-slate-700 text-white"
            />
            <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((char) => (
                <div
                  key={char.id}
                  onClick={() => {
                    setSelectedId(char.id)
                    onSelect?.(char)
                  }}
                  className={`p-3 rounded border cursor-pointer transition ${
                    selectedId === char.id ? "border-cyan-500 bg-cyan-500/10" : "border-slate-600 hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={char.portrait_url || "/placeholder.svg"}
                      alt={char.name}
                      className="w-12 h-12 rounded border border-slate-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{char.name}</p>
                      <p className="text-xs text-slate-400">Security: {char.security_status.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
