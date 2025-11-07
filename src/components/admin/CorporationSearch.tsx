"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { searchEveEntity, fetchEveCorporation, fetchCorporationLogo } from "../../lib/eve-api"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useToast } from "../../hooks/use-toast"
import { Loader2, Search } from "lucide-react"

export interface CorporationSearchResult {
  id: number
  name: string
  ticker: string
  member_count: number
  ceo_id: number
  founded: string
  logo_url: string
}

interface Props {
  onSelect?: (corporation: CorporationSearchResult) => void
}

export function CorporationSearch({ onSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<CorporationSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { toast } = useToast()

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!searchQuery.trim()) {
        toast({
          title: "Error",
          description: "Enter a corporation name",
          variant: "destructive",
        })
        return
      }

      setLoading(true)

      try {
        const searchResults = await searchEveEntity(searchQuery)

        if (!searchResults.corporation || searchResults.corporation.length === 0) {
          toast({
            title: "Not found",
            description: "No corporations found with that name",
            variant: "destructive",
          })
          setResults([])
          return
        }

        // Fetch full corporation data for each result
        const corpPromises = searchResults.corporation.map(async (corpId) => {
          try {
            const corpData = await fetchEveCorporation(corpId)
            const logoData = await fetchCorporationLogo(corpId)

            return {
              id: corpData.corporation_id,
              name: corpData.corporation_name,
              ticker: corpData.ticker,
              member_count: corpData.member_count,
              ceo_id: corpData.ceo_id,
              founded: corpData.founded,
              logo_url: logoData.px128x128,
            } as CorporationSearchResult
          } catch (error) {
            console.error(`[v0] Error fetching corporation ${corpId}:`, error)
            return null
          }
        })

        const corporations = (await Promise.all(corpPromises)).filter((c): c is CorporationSearchResult => c !== null)

        setResults(corporations)

        if (corporations.length === 0) {
          toast({
            title: "Error",
            description: "Failed to fetch corporation details",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[v0] Search error:", error)
        toast({
          title: "Error",
          description: "Failed to search corporations",
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
          <CardTitle className="text-white">Search Corporations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search corporation name..."
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
              {results.map((corp) => (
                <div
                  key={corp.id}
                  onClick={() => {
                    setSelectedId(corp.id)
                    onSelect?.(corp)
                  }}
                  className={`p-3 rounded border cursor-pointer transition ${
                    selectedId === corp.id ? "border-cyan-500 bg-cyan-500/10" : "border-slate-600 hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={corp.logo_url || "/placeholder.svg"}
                      alt={corp.name}
                      className="w-12 h-12 rounded border border-slate-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{corp.name}</p>
                      <p className="text-xs text-slate-400">
                        [{corp.ticker}] - {corp.member_count} members
                      </p>
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
