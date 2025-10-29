-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage dashboard layouts" ON public.dashboard_layout;

-- Allow users to manage their own dashboard layouts
CREATE POLICY "Users can manage own dashboard layout"
ON public.dashboard_layout
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all dashboard layouts
CREATE POLICY "Admins can manage all dashboard layouts"
ON public.dashboard_layout
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));