-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION log_audit_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_ARGV[0],
    TG_TABLE_NAME,
    NEW.id::VARCHAR,
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for profile creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (new.id, new.email);
  
  -- Assign member role to new users
  INSERT INTO user_roles (user_id, role_name)
  VALUES (new.id, 'member');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for audit logging on user_roles changes
CREATE TRIGGER audit_user_roles_insert
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_action('role_assigned');

CREATE TRIGGER audit_user_roles_delete
  AFTER DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_action('role_revoked');
