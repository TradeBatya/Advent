-- Seed initial roles and permissions
-- This script should be run after the schema is created

-- Admin role
INSERT INTO public.roles (name, description, permissions)
VALUES (
  'admin',
  'Full system access - can manage users, corporations, roles, and view audit logs',
  jsonb_build_object(
    'manage_users', true,
    'manage_corporations', true,
    'manage_roles', true,
    'view_audit_logs', true,
    'discord_integration', true,
    'view_corporations', true,
    'link_character', true
  )
)
ON CONFLICT (name) DO NOTHING;

-- Moderator role
INSERT INTO public.roles (name, description, permissions)
VALUES (
  'moderator',
  'Moderate users and manage Discord integration',
  jsonb_build_object(
    'manage_users', true,
    'discord_integration', true,
    'view_corporations', true,
    'link_character', true,
    'manage_corporations', false,
    'manage_roles', false,
    'view_audit_logs', false
  )
)
ON CONFLICT (name) DO NOTHING;

-- Member role (default)
INSERT INTO public.roles (name, description, permissions)
VALUES (
  'member',
  'Standard member - can link characters and view corporation data',
  jsonb_build_object(
    'view_corporations', true,
    'link_character', true,
    'manage_users', false,
    'manage_corporations', false,
    'manage_roles', false,
    'view_audit_logs', false,
    'discord_integration', false
  )
)
ON CONFLICT (name) DO NOTHING;

-- Grant first user admin role (replace with actual first admin user ID)
-- This should be done manually after the first user signs up
-- SELECT * FROM public.profiles LIMIT 1;
-- Then use the ID below
-- INSERT INTO public.user_roles (user_id, role_id)
-- SELECT 'USER_ID_HERE', id FROM public.roles WHERE name = 'admin'
-- ON CONFLICT (user_id, role_id) DO NOTHING;
