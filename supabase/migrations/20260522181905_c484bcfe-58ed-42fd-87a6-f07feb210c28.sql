
-- 1) Move has_role into a private schema so it cannot be invoked via PostgREST RPC
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

-- 2) Recreate all policies that referenced public.has_role to use private.has_role
-- community_games
DROP POLICY IF EXISTS "Admins can delete games" ON public.community_games;
DROP POLICY IF EXISTS "Admins can insert games" ON public.community_games;
DROP POLICY IF EXISTS "Admins can update games" ON public.community_games;
CREATE POLICY "Admins can delete games" ON public.community_games
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert games" ON public.community_games
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update games" ON public.community_games
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- private_server_avatars
DROP POLICY IF EXISTS "Admins can delete avatars" ON public.private_server_avatars;
DROP POLICY IF EXISTS "Admins can insert avatars" ON public.private_server_avatars;
DROP POLICY IF EXISTS "Admins can update avatars" ON public.private_server_avatars;
CREATE POLICY "Admins can delete avatars" ON public.private_server_avatars
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert avatars" ON public.private_server_avatars
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update avatars" ON public.private_server_avatars
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- site_settings
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can delete site settings" ON public.site_settings
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) Ensure RLS is enabled on user_roles (defense in depth against privilege escalation)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- 4) Explicit restrictive policy: nobody can INSERT into user_roles unless they're already admin
CREATE POLICY "Block non-admin role inserts" ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT TO anon, authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 5) Drop the public has_role function so it can no longer be called via RPC
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
