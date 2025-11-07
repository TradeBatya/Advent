"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../lib/auth-context"
import { createClient } from "../lib/supabase/client"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { CharacterLinking } from "../components/admin/character-linking"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { LogOut, Trash2 } from "lucide-react"

interface Character {
  id: string
  eve_character_id: number
  name: string
  corporation_id: string
}

export default function CharacterManagement() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const supabase = createClient()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate("/auth/login")
      return
    }

    fetchCharacters()
  }, [user])

  const fetchCharacters = async () => {
    try {
      const { data, error } = await supabase.from("characters").select("*").eq("user_id", user?.id)

      if (error) throw error
      setCharacters(data || [])
    } catch (error) {
      console.error("Error fetching characters:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      const { error } = await supabase.from("characters").delete().eq("id", characterId)

      if (error) throw error
      fetchCharacters()
    } catch (error) {
      console.error("Error deleting character:", error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Characters</h1>
            <p className="text-sm text-slate-400">Manage your linked EVE characters</p>
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
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Link Character */}
        <CharacterLinking userId={user?.id || ""} onSuccess={fetchCharacters} />

        {/* Characters List */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Linked Characters</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-slate-400">Loading...</div>
            ) : characters.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No characters linked yet. Link one above to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Character Name</TableHead>
                    <TableHead className="text-slate-300">Character ID</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {characters.map((char) => (
                    <TableRow key={char.id} className="border-slate-700">
                      <TableCell className="text-white">{char.name}</TableCell>
                      <TableCell className="text-slate-300 font-mono">{char.eve_character_id}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCharacter(char.id)}
                          className="text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
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
  )
}
