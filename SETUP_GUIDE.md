# EVE Portal Admin System - Setup Guide

This guide will help you set up the complete EVE Portal Admin System with all features.

## Prerequisites

- Vercel account connected to GitHub
- Supabase project set up
- Environment variables configured

## Setup Steps

### 1. Database Setup

First, run the migration scripts to create the database schema:

\`\`\`bash
# The migrations should be run in order:
# 1. migrations/001_init_database.sql - Creates all tables and indexes
# 2. migrations/002_setup_rls_policies.sql - Sets up Row Level Security
# 3. migrations/003_seed_initial_data.sql - Seeds initial roles and plugins
# 4. migrations/004_create_trigger_functions.sql - Creates triggers
\`\`\`

To run migrations in Supabase:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Create a new query and paste the migration content
4. Execute each migration in order

### 2. Environment Variables

Set these variables in your Vercel project:

\`\`\`
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 3. Edge Functions

Deploy the edge functions to Supabase:

- `manage-roles` - Handles role assignment/revocation
- `discord-oauth` - Handles Discord authentication

### 4. Create Admin User

After migrations are complete:

1. Sign up a user through the portal
2. Manually update their role in the database:

\`\`\`sql
INSERT INTO user_roles (user_id, role_name)
VALUES ('user-uuid', 'admin');
\`\`\`

### 5. Access Admin Panel

- Navigate to `/admin`
- You should see the admin dashboard with all management panels

## Database Schema

### Tables

- **profiles** - User profile information
- **user_roles** - Maps users to roles
- **roles** - Role definitions with permissions
- **corporations** - EVE Online corporations
- **characters** - EVE character data
- **plugins** - Portal plugins
- **role_plugins** - Maps roles to plugins with permissions
- **audit_logs** - System audit trail
- **discord_accounts** - Discord integration

### Row Level Security (RLS)

All tables have RLS policies:
- Users can only see their own data by default
- Admins and moderators can see all data
- Audit logs are only visible to admins

## Features

### User Management
- View all users
- Assign/revoke roles
- Delete users
- View user details

### Role Management  
- View role hierarchy
- Assign permissions
- Grant/revoke roles from users
- Color-coded role badges by hierarchy level

### Plugin Management
- Enable/disable plugins
- View plugin permissions
- See plugin version and status

### Corporation Management
- Add EVE corporations
- View corporation details
- Delete corporations

### Audit Logs
- View all system activities
- Filter by user, action, status
- See timestamps and error messages

### Discord Integration
- Link/unlink Discord accounts
- OAuth2 support (setup required)

## Troubleshooting

### Edge Functions Returning Errors

If edge functions are failing:

1. Check the edge function logs in Supabase
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
3. Verify the function code is deployed

### Database Connection Issues

If you get database errors:

1. Check Supabase connection
2. Verify RLS policies aren't blocking your queries
3. Ensure you have the correct role/permissions

### Admin Dashboard Not Visible

If you don't see the admin panel:

1. Verify you have an admin or moderator role
2. Check that migrations ran successfully
3. Verify `user_roles` table has your user assigned to `admin` role

## Development

The admin system is built with:
- React + TypeScript
- Supabase for data and auth
- shadcn/ui for components
- Edge Functions for backend logic
- Tailwind CSS for styling

All admin components are in `/src/components/admin/` and use the centralized Supabase client from `/src/integrations/supabase/client.ts`.
