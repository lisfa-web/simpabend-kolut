-- Add a default flag to dashboard_layout so demo admins can read it safely
ALTER TABLE public.dashboard_layout
ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

-- Helper to check roles using text to avoid enum mismatch issues
CREATE OR REPLACE FUNCTION public.has_role_text(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role::text = _role
  );
$$;

-- Ensure RLS is enabled
ALTER TABLE public.dashboard_layout ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read default layouts or their own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dashboard_layout' 
      AND policyname = 'select_own_or_default_dashboard_layout'
  ) THEN
    CREATE POLICY "select_own_or_default_dashboard_layout"
    ON public.dashboard_layout
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR is_default = true);
  END IF;
END$$;

-- Allow users to insert/update their own layout; only super_admin can set is_default=true
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename = 'dashboard_layout'
      AND policyname = 'upsert_own_dashboard_layout'
  ) THEN
    CREATE POLICY "upsert_own_dashboard_layout"
    ON public.dashboard_layout
    FOR INSERT
    TO authenticated
    WITH CHECK (
      user_id = auth.uid() 
      AND (is_default = false OR public.has_role_text(auth.uid(), 'super_admin'))
    );

    CREATE POLICY "update_own_dashboard_layout"
    ON public.dashboard_layout
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
      user_id = auth.uid() 
      AND (is_default = false OR public.has_role_text(auth.uid(), 'super_admin'))
    );
  END IF;
END$$;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_dashboard_layout_is_default ON public.dashboard_layout (is_default);
