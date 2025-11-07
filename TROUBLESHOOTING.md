# Troubleshooting Guide

## Common Issues and Solutions

### Edge Function "Non-2xx Status Code" Error

**Problem**: Edge functions return error responses

**Solutions**:
1. Check edge function logs in Supabase dashboard
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correctly set
3. Ensure the request body is properly formatted
4. Check that authentication token is valid

### Discord OAuth Issues

**Problem**: Discord linking fails or returns errors

**Solutions**:
1. Verify Discord OAuth app is set up correctly
2. Check callback URL matches Discord app settings
3. Verify scopes are correct (usually `identify` and `email`)
4. Check auth token expiration

### RLS Policy Denials

**Problem**: "RLS policy violation" errors

**Solutions**:
1. Verify you have the correct role assigned
2. Check RLS policies allow your action
3. For admin operations, ensure you have `admin` role
4. Check that `auth.uid()` is being used correctly in policies

### Users Can't Access Admin Panel

**Problem**: Users see "Access Denied" on /admin

**Solutions**:
1. Verify user has `admin`, `moderator`, or `developer` role
2. Check `user_roles` table for the user ID
3. Verify auth session is valid
4. Check browser console for specific error messages

### Database Migrations Failed

**Problem**: Tables don't exist or migrations didn't run

**Solutions**:
1. Check Supabase SQL editor for any error messages
2. Verify each migration file syntax
3. Run migrations in the correct order
4. Check that you have permissions to create tables

### Plugins Not Loading

**Problem**: Plugin list is empty or won't load

**Solutions**:
1. Verify `plugins` table has data (run seed migration)
2. Check RLS policies for `plugins` table
3. Verify user has permission to view plugins
4. Check browser console for API errors

### Audit Logs Not Recording

**Problem**: Audit logs are empty

**Solutions**:
1. Verify trigger functions were created (migration 004)
2. Check `audit_logs` table RLS policies
3. Verify actions are being performed by admin users
4. Check that user_id in audit_logs matches current user

## Debug Logging

Enable debug logging by looking for `[v0]` console messages:

\`\`\`javascript
console.log("[v0] Debug message here")
\`\`\`

These logs appear in browser console (F12) and help trace execution flow.

## Getting Help

If issues persist:
1. Check the migration files for correct SQL
2. Verify all environment variables are set
3. Review Supabase dashboard logs
4. Check browser console for error details
5. Review component code for logic errors
