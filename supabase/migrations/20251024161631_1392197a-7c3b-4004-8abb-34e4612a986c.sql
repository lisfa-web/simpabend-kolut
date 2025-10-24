-- Assign super_admin role to jarmot.sukardi@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'super_admin'::public.app_role
FROM public.profiles p
WHERE p.email = 'jarmot.sukardi@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;