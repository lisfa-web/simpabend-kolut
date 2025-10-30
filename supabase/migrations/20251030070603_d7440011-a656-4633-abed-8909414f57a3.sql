-- Create can_write() function to check if user can perform mutations
-- This excludes demo_admin from write operations
CREATE OR REPLACE FUNCTION public.can_write(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('administrator', 'kepala_bkad')
  ) 
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role::text = 'demo_admin'
  )
$$;

COMMENT ON FUNCTION public.can_write IS 'Check if user has write permissions (excludes demo_admin)';