-- Seed roles
INSERT INTO roles (name, display_name, description, hierarchy_level, permissions) VALUES
  ('admin', 'Administrator', 'Full system access', 100, '{"all": true}'::jsonb),
  ('moderator', 'Moderator', 'Manage users and content', 70, '{"manage_users": true, "manage_content": true, "view_logs": true}'::jsonb),
  ('developer', 'Developer', 'Technical access for development', 85, '{"manage_plugins": true, "manage_roles": true, "view_logs": true}'::jsonb),
  ('member', 'Member', 'Standard member', 10, '{"view_content": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Seed plugins
INSERT INTO plugins (name, display_name, description, version, is_enabled, permissions) VALUES
  ('user_management', 'User Management', 'Manage users and roles', '1.0.0', TRUE, '["create_user", "edit_user", "delete_user", "assign_role"]'::jsonb),
  ('content_management', 'Content Management', 'Manage news and intel', '1.0.0', TRUE, '["create_news", "edit_news", "delete_news"]'::jsonb),
  ('operations', 'Operations', 'Manage fleet operations', '1.0.0', TRUE, '["create_operation", "edit_operation", "delete_operation"]'::jsonb),
  ('intel', 'Intel System', 'Share intel reports', '1.0.0', TRUE, '["create_intel", "edit_intel", "delete_intel", "view_intel"]'::jsonb),
  ('discord_integration', 'Discord Integration', 'Link Discord accounts', '1.0.0', TRUE, '["link_discord", "unlink_discord"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Assign plugins to roles
INSERT INTO role_plugins (role_name, plugin_id, permissions) 
SELECT 
  roles.name,
  plugins.id,
  CASE 
    WHEN roles.name = 'admin' THEN plugins.permissions
    WHEN roles.name = 'moderator' AND plugins.name IN ('user_management', 'content_management') THEN plugins.permissions
    WHEN roles.name = 'developer' THEN plugins.permissions
    WHEN roles.name = 'member' AND plugins.name IN ('intel', 'operations', 'discord_integration') THEN '["view_intel", "create_intel", "create_operation"]'::jsonb
    ELSE '[]'::jsonb
  END
FROM roles, plugins
WHERE NOT EXISTS (
  SELECT 1 FROM role_plugins rp 
  WHERE rp.role_name = roles.name 
  AND rp.plugin_id = plugins.id
);
