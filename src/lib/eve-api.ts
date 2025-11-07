// ESI API client for EVE Online
const ESI_BASE_URL = "https://esi.eveonline.com/latest"

const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(path: string): string {
  return `esi:${path}`
}

function getFromCache(key: string): any | null {
  const cached = apiCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    apiCache.delete(key)
    return null
  }
  return cached.data
}

function setCache(key: string, data: any): void {
  apiCache.set(key, { data, timestamp: Date.now() })
}

export class EveApiError extends Error {
  constructor(
    public statusCode: number,
    public statusText: string,
    message: string,
  ) {
    super(message)
    this.name = "EveApiError"
  }
}

export interface EveCharacter {
  character_id: number
  character_name: string
  corporation_id: number
  alliance_id: number
  security_status: number
}

export interface EveCorporation {
  corporation_id: number
  corporation_name: string
  ticker: string
  member_count: number
  alliance_id: number
  founded: string
  ceo_id: number
}

export async function fetchEveCharacter(characterId: number): Promise<EveCharacter> {
  const cacheKey = getCacheKey(`characters/${characterId}`)
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(`${ESI_BASE_URL}/characters/${characterId}`)
    if (!response.ok) {
      throw new EveApiError(response.status, response.statusText, `Failed to fetch character ${characterId}`)
    }
    const data: EveCharacter = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error("[v0] EVE API Error:", error)
    throw error
  }
}

export async function fetchEveCorporation(corporationId: number): Promise<EveCorporation> {
  const cacheKey = getCacheKey(`corporations/${corporationId}`)
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(`${ESI_BASE_URL}/corporations/${corporationId}`)
    if (!response.ok) {
      throw new EveApiError(response.status, response.statusText, `Failed to fetch corporation ${corporationId}`)
    }
    const data: EveCorporation = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error("[v0] EVE API Error:", error)
    throw error
  }
}

export async function searchEveEntity(query: string): Promise<{
  character: number[]
  corporation: number[]
  alliance: number[]
}> {
  const params = new URLSearchParams({
    search: query,
    categories: "character,corporation,alliance",
    strict: "false",
  })

  const response = await fetch(`${ESI_BASE_URL}/search?${params.toString()}`)
  if (!response.ok) throw new Error("Search failed")
  return response.json()
}

export async function fetchCharacterPortrait(characterId: number): Promise<{
  px64x64: string
  px128x128: string
  px256x256: string
}> {
  const response = await fetch(`${ESI_BASE_URL}/characters/${characterId}/portrait`)
  if (!response.ok) throw new Error("Failed to fetch portrait")
  return response.json()
}

export async function fetchCorporationLogo(corporationId: number): Promise<{
  px64x64: string
  px128x128: string
  px256x256: string
}> {
  const response = await fetch(`${ESI_BASE_URL}/corporations/${corporationId}/logo`)
  if (!response.ok) throw new Error("Failed to fetch logo")
  return response.json()
}

export async function validateCharacterId(characterId: number): Promise<boolean> {
  try {
    await fetchEveCharacter(characterId)
    return true
  } catch {
    return false
  }
}

export async function fetchMultipleCharacters(characterIds: number[]): Promise<EveCharacter[]> {
  try {
    const characters = await Promise.all(characterIds.map((id) => fetchEveCharacter(id).catch(() => null)))
    return characters.filter((c): c is EveCharacter => c !== null)
  } catch (error) {
    console.error("[v0] Error fetching multiple characters:", error)
    return []
  }
}

export async function fetchMultipleCorporations(corporationIds: number[]): Promise<EveCorporation[]> {
  try {
    const corporations = await Promise.all(corporationIds.map((id) => fetchEveCorporation(id).catch(() => null)))
    return corporations.filter((c): c is EveCorporation => c !== null)
  } catch (error) {
    console.error("[v0] Error fetching multiple corporations:", error)
    return []
  }
}

export function clearEveApiCache(): void {
  apiCache.clear()
  console.log("[v0] EVE API cache cleared")
}

export function getEveCacheStats(): { size: number; entries: string[] } {
  return {
    size: apiCache.size,
    entries: Array.from(apiCache.keys()),
  }
}
