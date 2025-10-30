-- Ensure RLS is enabled (no-op if already enabled)
alter table public.config_sistem enable row level security;

-- Create SELECT policy for sidebar_template if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'config_sistem' 
      AND policyname = 'Public can read sidebar template'
  ) THEN
    CREATE POLICY "Public can read sidebar template"
    ON public.config_sistem
    FOR SELECT
    TO authenticated
    USING (key = 'sidebar_template');
  END IF;
END $$;

-- If no default dashboard layout exists, set the latest super_admin layout as default
WITH has_default AS (
  SELECT count(*)::int AS cnt FROM public.dashboard_layout WHERE is_default = true
), sa AS (
  SELECT ur.user_id
  FROM public.user_roles ur
  WHERE ur.role = 'super_admin'
  ORDER BY ur.user_id
  LIMIT 1
), latest AS (
  SELECT dl.id
  FROM public.dashboard_layout dl
  JOIN sa ON dl.user_id = sa.user_id
  ORDER BY dl.updated_at DESC NULLS LAST, dl.created_at DESC NULLS LAST
  LIMIT 1
)
UPDATE public.dashboard_layout dl
SET is_default = true, updated_at = now()
FROM latest, has_default
WHERE dl.id = latest.id AND has_default.cnt = 0;