# Real-time System and EVE ESI Integration Guide

## Real-time Subscriptions

This application uses Supabase Realtime for live data updates across the admin dashboard.

### Available Hooks

#### `useRealtimeSubscription`
Subscribe to changes in a specific table:

\`\`\`tsx
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

function MyComponent() {
  useRealtimeSubscription(
    'profiles',
    (payload) => {
      console.log('Data changed:', payload)
    },
    { event: '*' } // '*' for all events, or 'INSERT', 'UPDATE', 'DELETE'
  )
}
\`\`\`

#### `useRealtimeMultiSubscription`
Subscribe to multiple tables at once:

\`\`\`tsx
import { useRealtimeMultiSubscription } from '@/hooks/useRealtimeSubscription'

function MyComponent() {
  useRealtimeMultiSubscription(
    ['profiles', 'characters', 'corporations'],
    (table, payload) => {
      console.log(`${table} changed:`, payload)
    }
  )
}
\`\`\`

#### `useRealtimeStats`
Get live statistics that auto-update:

\`\`\`tsx
import { useRealtimeStats } from '@/hooks/useRealtimeStats'

function Dashboard() {
  const { stats, loading } = useRealtimeStats()
  
  return <div>Total Users: {stats.totalUsers}</div>
}
\`\`\`

#### `useRealtimeTable`
Fetch and subscribe to table data:

\`\`\`tsx
import { useRealtimeTable } from '@/hooks/useRealtimeTable'

function UserList() {
  const { data, loading, refetch } = useRealtimeTable({
    table: 'profiles',
    select: 'id, username, email',
    limit: 50,
    orderBy: { column: 'created_at', ascending: false }
  })
  
  return <div>{data.length} users</div>
}
\`\`\`

## EVE ESI API Integration

The EVE ESI API client provides access to EVE Online data with built-in caching.

### Character Search and Lookup

\`\`\`tsx
import { CharacterSearch } from '@/components/admin/CharacterSearch'

function MyComponent() {
  return (
    <CharacterSearch 
      onSelect={(character) => {
        console.log('Selected:', character)
      }}
    />
  )
}
\`\`\`

### Corporation Search

\`\`\`tsx
import { CorporationSearch } from '@/components/admin/CorporationSearch'

function MyComponent() {
  return (
    <CorporationSearch 
      onSelect={(corporation) => {
        console.log('Selected:', corporation)
      }}
    />
  )
}
\`\`\`

### Direct API Usage

\`\`\`tsx
import {
  fetchEveCharacter,
  fetchEveCorporation,
  searchEveEntity,
  validateCharacterId,
  fetchMultipleCharacters,
  clearEveApiCache
} from '@/lib/eve-api'

// Fetch single character
const character = await fetchEveCharacter(2112625428)

// Fetch corporation
const corp = await fetchEveCorporation(98007942)

// Search for entities
const results = await searchEveEntity('Player Name')

// Validate character exists
const isValid = await validateCharacterId(2112625428)

// Fetch multiple characters
const characters = await fetchMultipleCharacters([123, 456, 789])

// Clear cache
clearEveApiCache()
\`\`\`

## Real-time Activity Monitoring

The dashboard includes a live activity feed showing all admin actions:

\`\`\`tsx
import { RealtimeActivityFeed } from '@/components/admin/RealtimeActivityFeed'

function Dashboard() {
  return (
    <>
      <RealtimeActivityFeed />
    </>
  )
}
\`\`\`

## Service Functions

Common operations are available through the realtime-service module:

\`\`\`tsx
import {
  fetchRecentActivity,
  fetchUsersWithRoles,
  fetchCorporations,
  updateUserRole,
  deleteUser,
  createCorporation
} from '@/lib/realtime-service'

// Fetch recent activity logs
const logs = await fetchRecentActivity(50)

// Get users with their roles
const users = await fetchUsersWithRoles(100)

// Fetch corporations
const corps = await fetchCorporations()

// Update user role
await updateUserRole(userId, roleId, true) // grant access
await updateUserRole(userId, roleId, false) // revoke access

// Delete user
await deleteUser(userId)

// Create corporation
const newCorp = await createCorporation({
  name: 'My Corp',
  ticker: 'MYCOR',
  eve_corp_id: 98007942
})
\`\`\`

## Caching

The EVE API client includes automatic caching with a 5-minute TTL:

\`\`\`tsx
import { getEveCacheStats, clearEveApiCache } from '@/lib/eve-api'

// Check cache status
const stats = getEveCacheStats()
console.log(`Cache size: ${stats.size}, Entries: ${stats.entries}`)

// Clear cache
clearEveApiCache()
\`\`\`

## Character Linking

The character linking system integrates search, validation, and database storage:

\`\`\`tsx
import { CharacterLinking } from '@/components/admin/character-linking'

function Profile() {
  return (
    <CharacterLinking
      userId={user.id}
      onSuccess={() => {
        // Refresh data after linking
        refetchCharacters()
      }}
    />
  )
}
\`\`\`
