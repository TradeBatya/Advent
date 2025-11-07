# Development Guide

## Project Structure

\`\`\`
src/
├── components/
│   ├── admin/
│   │   ├── AdminUsers.tsx
│   │   ├── AdminCorporations.tsx
│   │   ├── AdminRoles.tsx
│   │   ├── RoleManagement.tsx
│   │   ├── DiscordIntegration.tsx
│   │   └── CharacterLinking.tsx
│   ├── protected-route.tsx
│   ├── permission-gate.tsx
│   └── ui/
├── pages/
│   ├── Admin.tsx
│   ├── Auth.tsx
│   ├── Profile.tsx
│   ├── CharacterManagement.tsx
│   └── AuditLogs.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── use-rbac.ts
│   └── use-toast.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── rbac.ts
│   ├── audit-logger.ts
│   ├── eve-api.ts
│   └── supabase/functions.ts
└── integrations/
    └── supabase/
        ├── client.ts
        └── types.ts
\`\`\`

## Running Locally

\`\`\`bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Visit http://localhost:5173
\`\`\`

## Database Migrations

For schema changes:

1. Create a new SQL file in `scripts/` (e.g., `003_add_new_table.sql`)
2. Test locally in Supabase
3. Document changes in comments
4. Run on production after testing

## Adding New Roles

1. Insert into `roles` table with permissions JSON
2. Create RLS policies for data access
3. Add role checks to components
4. Test with new user account

## Adding New Features

1. Create database table with RLS policies
2. Add Supabase functions if needed
3. Create React components
4. Add RBAC permission checks
5. Test with different roles
6. Add to admin dashboard if needed

## Testing

\`\`\`bash
# Test authentication flow
# 1. Sign up new account
# 2. Verify email (in Supabase)
# 3. Sign in
# 4. Check profile creation

# Test role management
# 1. Login as admin
# 2. Change user role
# 3. Verify permissions change
# 4. Logout and re-login

# Test real-time updates
# 1. Open dashboard in two tabs
# 2. Make change in one tab
# 3. Verify update appears in other tab
\`\`\`

## Common Tasks

### Add Discord Role Sync

\`\`\`ts
// After Discord OAuth callback, fetch Discord roles and sync
const discordRoles = await fetchUserDiscordRoles(discordId)
await syncDiscordRolesToPortal(userId, discordRoles)
\`\`\`

### Add ESI Scopes

Edit `src/lib/eve-api.ts` and add scopes to ESI auth URL:

\`\`\`ts
const scopes = ['esi-scope-1.read', 'esi-scope-2.write'].join(' ')
\`\`\`

### Add Audit Logging

\`\`\`ts
import { logAuditEntry } from '@/lib/audit-logger'

await logAuditEntry({
  user_id: userId,
  action: 'UPDATE',
  table_name: 'users',
  record_id: userId,
  changes: { role: 'admin' },
})
\`\`\`

## Performance Optimization

1. Use Supabase indexes on frequently queried columns
2. Paginate large result sets
3. Cache EVE ESI data with TTL
4. Debounce real-time subscription updates
5. Lazy load admin components

## Security Checklist

- [ ] All auth routes have HTTPS redirect
- [ ] RLS policies prevent data leakage
- [ ] Sensitive operations logged in audit_logs
- [ ] Rate limiting on OAuth endpoints
- [ ] CSRF tokens validated
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] Environment secrets not committed
