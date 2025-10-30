-- Update RLS policies for profiles table to use can_write()
-- This prevents demo_admin from creating/updating profiles

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (can_write(auth.uid()));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (can_write(auth.uid()))
WITH CHECK (can_write(auth.uid()));

-- Update RLS policies for user_roles table to use can_write()
-- This prevents demo_admin from managing user roles

DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (can_write(auth.uid()))
WITH CHECK (can_write(auth.uid()));

COMMENT ON POLICY "Admins can insert profiles" ON public.profiles IS 'Only administrators (excluding demo_admin) can create profiles';
COMMENT ON POLICY "Admins can update any profile" ON public.profiles IS 'Only administrators (excluding demo_admin) can update profiles';
COMMENT ON POLICY "Admins can manage user roles" ON public.user_roles IS 'Only administrators (excluding demo_admin) can manage user roles';