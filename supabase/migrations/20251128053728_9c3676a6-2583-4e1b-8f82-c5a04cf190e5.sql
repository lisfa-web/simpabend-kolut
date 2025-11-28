-- Fix can_write function to include super_admin role
CREATE OR REPLACE FUNCTION public.can_write(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('administrator', 'kepala_bkad', 'super_admin')
  ) 
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role::text = 'demo_admin'
  )
$function$;