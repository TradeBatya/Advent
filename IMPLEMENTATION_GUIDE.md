# EVE Portal Admin System - Implementation Guide

## Overview

This is a complete full-stack EVE Online alliance portal with admin dashboard, real-time updates, and role-based access control (RBAC).

## Architecture

### Technology Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Real-time**: Supabase Realtime subscriptions
- **ESI Integration**: EVE Online ESI API
- **Discord Integration**: Discord OAuth2

### Core Features

1. **Authentication System**
   - Email/password signup and login
   - Session management via Supabase Auth
   - Profile auto-creation on signup

2. **Role-Based Access Control (RBAC)**
   - Three roles: Admin, Moderator, Member
   - Permission-based access to features
   - Protected routes and components

3. **Admin Dashboard**
   - Real-time user management
   - Corporation management
   - Role assignment
   - Audit logging

4. **Character Management**
   - Link EVE characters via ESI OAuth
   - Search and add characters
   - Corporation tracking

5. **Discord Integration**
   - Link Discord accounts
   - Automatic role synchronization
   - Community notifications

## Database Schema

### Tables

#### `public.profiles`
User profile information extending Supabase auth.users
- `id` (UUID) - Foreign key to auth.users
- `username` (TEXT) - Unique username
- `full_name` (TEXT) - User's full name
- `avatar_url` (TEXT) - Avatar image URL
- `created_at`, `updated_at` - Timestamps

#### `public.corporations`
EVE Online corporations
- `id` (UUID) - Primary key
- `eve_corp_id` (BIGINT) - EVE corporation ID
- `name` (TEXT) - Corporation name
- `ticker` (TEXT) - Corporation ticker
- `alliance_id` (BIGINT) - Alliance ID
- `created_at`, `updated_at` - Timestamps

#### `public.characters`
User's linked EVE characters
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to profiles
- `eve_character_id` (BIGINT) - EVE character ID
- `name` (TEXT) - Character name
- `corporation_id` (UUID) - Foreign key to corporations
- `created_at`, `updated_at` - Timestamps

#### `public.roles`
Permission roles
- `id` (UUID) - Primary key
- `name` (TEXT) - Role name (admin, moderator, member)
- `description` (TEXT) - Role description
- `permissions` (JSONB) - Permissions mapping
- `created_at` - Timestamp

#### `public.user_roles`
User to role mapping (many-to-many)
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to profiles
- `role_id` (UUID) - Foreign key to roles
- `granted_at` - When role was assigned
- `granted_by` (UUID) - Who granted the role
- Unique constraint on (user_id, role_id)

#### `public.discord_accounts`
Discord account linking
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to profiles (unique)
- `discord_id` (TEXT) - Discord user ID
- `discord_username` (TEXT) - Discord username
- `created_at`, `updated_at` - Timestamps

#### `public.audit_logs`
System activity logging
- `id` (UUID) - Primary key
- `user_id` (UUID) - Who performed the action
- `action` (TEXT) - Action type (INSERT, UPDATE, DELETE)
- `table_name` (TEXT) - Table affected
- `record_id` (TEXT) - ID of affected record
- `changes` (JSONB) - What changed
- `created_at` - Timestamp

## Setup Instructions

### 1. Database Setup

\`\`\`bash
# Run the initial schema script in Supabase SQL Editor
# scripts/001_init_database.sql

# Then seed initial roles
# scripts/002_seed_initial_roles.sql
\`\`\`

### 2. Environment Variables

\`\`\`env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_EVE_CLIENT_ID=your_eve_client_id
VITE_EVE_CLIENT_SECRET=your_eve_client_secret
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret
\`\`\`

### 3. First Admin User

\`\`\`bash
# After the first user signs up, promote them to admin
ts-node scripts/create_admin_user.ts admin@example.com
\`\`\`

## Role-Based Access Control

### Roles and Permissions

#### Admin
- manage_users (change user roles, manage accounts)
- manage_corporations (add/edit corporations)
- manage_roles (modify role permissions)
- view_audit_logs (view system activity)
- discord_integration (manage Discord linking)
- view_corporations (view corp data)
- link_character (link EVE characters)

#### Moderator
- manage_users (change user roles)
- discord_integration (manage Discord linking)
- view_corporations (view corp data)
- link_character (link EVE characters)

#### Member (Default)
- view_corporations (view corp data)
- link_character (link EVE characters)

### Using RBAC

\`\`\`tsx
import { useRole } from '@/hooks/use-rbac'
import { PermissionGate } from '@/components/permission-gate'

// Check user role
function MyComponent() {
  const { role } = useRole()
  
  return role === 'admin' && <AdminPanel />
}

// Check specific permission
function MyComponent() {
  return (
    <PermissionGate permission="manage_users">
      <UserManagementPanel />
    </PermissionGate>
  )
}
\`\`\`

## API Integration

### EVE ESI API

Character and corporation data fetching:

\`\`\`ts
import { fetchEveCharacter, searchEveEntity } from '@/lib/eve-api'

const charData = await fetchEveCharacter(characterId)
const results = await searchEveEntity('Character Name')
\`\`\`

### Discord OAuth

User-initiated Discord linking:

\`\`\`tsx
import { DiscordIntegration } from '@/components/admin/DiscordIntegration'

export function ProfilePage() {
  return <DiscordIntegration />
}
\`\`\`

## Real-time Updates

All admin dashboard components use Supabase Realtime for live updates:

\`\`\`ts
const subscription = supabase
  .channel('profiles')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'profiles' },
    () => fetchUsers()
  )
  .subscribe()
\`\`\`

## Security

### Row Level Security (RLS)

All tables have RLS policies:
- Users can only access their own data
- Admins can access all data
- Public read access for corporations

### Best Practices

1. Always use server-side Supabase client for sensitive operations
2. Validate permissions server-side, not just client-side
3. Log important actions in audit_logs table
4. Use HTTPS for all OAuth callbacks
5. Store sensitive tokens encrypted in the database

## Troubleshooting

### Users not getting admin role
- Check that roles were seeded with `scripts/002_seed_initial_roles.sql`
- Verify user_roles table has entries
- Run: SELECT * FROM user_roles WHERE user_id = 'USER_ID'

### Character linking fails
- Check EVE ESI is accessible
- Verify character exists in EVE Online
- Check corporation exists in database or gets auto-created

### Discord integration not working
- Verify Discord OAuth credentials in env vars
- Check redirect URL matches Discord app settings
- Review DiscordCallback page for error handling

### Real-time updates not syncing
- Ensure Realtime is enabled in Supabase
- Check browser console for connection errors
- Verify table has `is_subscribed_for_realtime` enabled

## Deployment

1. Deploy database schema to production Supabase
2. Run seed scripts for initial data
3. Set environment variables in Vercel
4. Deploy frontend to Vercel
5. Test OAuth flows with production URLs
6. Create first admin user

## Support

For issues or questions:
1. Check error messages in browser console
2. Review Supabase logs in dashboard
3. Verify all environment variables are set
4. Test with simple operations first (login, create user)
